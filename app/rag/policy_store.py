import json
import logging
import os
from typing import Any, Dict, List, Optional

import chromadb

from app.config import settings
from app.models.claim_schemas import InsuranceLine
from app.models.verdict_schemas import PolicyClauseMatch

logger = logging.getLogger(__name__)


class PolicyStore:
    def __init__(self, persist_dir: Optional[str] = None):
        self.persist_dir = persist_dir or settings.CHROMA_PERSIST_DIR
        os.makedirs(self.persist_dir, exist_ok=True)

        # Initialize Chroma persistent client
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        self.collection = self.client.get_or_create_collection(
            name="insurance_policy_clauses",
            metadata={"hnsw:space": "cosine"}
        )
        self._policies_cache: Dict[str, Dict[str, Any]] = {}
        self.load_and_index_policies()

    def load_and_index_policies(self):
        """Loads JSON policies from data directory and indexes them in ChromaDB."""
        data_dir = settings.POLICY_DATA_DIR
        if not os.path.exists(data_dir):
            os.makedirs(data_dir, exist_ok=True)
            return

        documents: List[str] = []
        metadatas: List[Dict[str, Any]] = []
        ids: List[str] = []

        for filename in os.listdir(data_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(data_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)

                    policy_id = str(data.get("policy_id", ""))
                    self._policies_cache[policy_id] = data

                    clauses = data.get("clauses", [])
                    for clause in clauses:
                        c_id = f"{policy_id}_{clause['clause_id']}"
                        doc_text = f"Policy: {data.get('coverage_type')} ({data.get('insurance_line')}). " \
                                   f"Section {clause.get('section_number')} - {clause.get('section_title')}: {clause.get('content')}"

                        documents.append(doc_text)
                        ids.append(c_id)
                        metadatas.append({
                            "policy_id": policy_id,
                            "insurance_line": str(data.get("insurance_line", "")),
                            "clause_id": str(clause.get("clause_id", "")),
                            "section_number": str(clause.get("section_number", "")),
                            "section_title": str(clause.get("section_title", "")),
                            "is_exclusion": str(clause.get("is_exclusion", False)).lower(),
                            "content": str(clause.get("content", ""))
                        })
                except Exception as e:
                    logger.error(f"Error loading policy file {filename}: {e}")

        if documents:
            self.collection.upsert(
                documents=documents,
                metadatas=metadatas,  # type: ignore
                ids=ids
            )
            logger.info(f"Indexed {len(documents)} policy clauses into ChromaDB.")

    def get_policy(self, policy_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full policy data by ID."""
        return self._policies_cache.get(policy_id)

    def get_all_policies(self) -> List[Dict[str, Any]]:
        """Return all preloaded policies."""
        return list(self._policies_cache.values())

    def search_clauses(
        self,
        query: str,
        insurance_line: Optional[InsuranceLine] = None,
        policy_id: Optional[str] = None,
        top_k: int = 5
    ) -> List[PolicyClauseMatch]:
        """Perform semantic search on policy clauses."""
        where_filter: Dict[str, Any] = {}
        if policy_id:
            where_filter["policy_id"] = policy_id
        elif insurance_line:
            where_filter["insurance_line"] = str(insurance_line.value if hasattr(insurance_line, "value") else insurance_line)

        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_filter if where_filter else None  # type: ignore
            )

            matches: List[PolicyClauseMatch] = []
            if results and results.get("ids") and len(results["ids"]) > 0 and len(results["ids"][0]) > 0:
                result_metadatas = results.get("metadatas")
                result_distances = results.get("distances")

                if result_metadatas and len(result_metadatas) > 0:
                    for i in range(len(results["ids"][0])):
                        meta = result_metadatas[0][i] or {}
                        dist = result_distances[0][i] if result_distances and len(result_distances) > 0 else 0.2
                        relevance = max(0.0, min(1.0, 1.0 - (float(dist) / 2.0)))

                        matches.append(PolicyClauseMatch(
                            clause_id=str(meta.get("clause_id", "")),
                            section_title=str(meta.get("section_title", "")),
                            section_number=str(meta.get("section_number", "")),
                            content=str(meta.get("content", "")),
                            relevance_score=round(relevance, 3),
                            is_exclusion=(str(meta.get("is_exclusion", "false")) == "true")
                        ))
                    return matches
        except Exception as e:
            logger.warning(f"ChromaDB search failed, using fallback clause scan: {e}")

        # Fallback in-memory matching if query fails
        fallback_matches: List[PolicyClauseMatch] = []
        for p_id, p_data in self._policies_cache.items():
            if policy_id and p_id != policy_id:
                continue
            if insurance_line and p_data.get("insurance_line") != (insurance_line.value if hasattr(insurance_line, "value") else insurance_line):
                continue

            for clause in p_data.get("clauses", []):
                content_lower = str(clause.get("content", "")).lower()
                query_words = [w.lower() for w in query.split() if len(w) > 3]
                match_count = sum(1 for w in query_words if w in content_lower)
                score = round(min(0.95, 0.5 + (match_count * 0.1)), 2) if match_count > 0 else 0.4

                fallback_matches.append(PolicyClauseMatch(
                    clause_id=str(clause.get("clause_id", "")),
                    section_title=str(clause.get("section_title", "")),
                    section_number=str(clause.get("section_number", "")),
                    content=str(clause.get("content", "")),
                    relevance_score=score,
                    is_exclusion=bool(clause.get("is_exclusion", False))
                ))

        fallback_matches.sort(key=lambda x: x.relevance_score, reverse=True)
        return fallback_matches[:top_k]


# Global Singleton
policy_store = PolicyStore()

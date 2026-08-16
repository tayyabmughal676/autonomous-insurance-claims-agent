import logging
from typing import Dict, List, Optional

from app.data.preloaded_claims import get_preloaded_claims
from app.models.claim_schemas import Claim
from app.models.state_schemas import ClaimProcessingState

logger = logging.getLogger(__name__)


class MemoryClaimRepository:
    def __init__(self):
        self.claims: Dict[str, Claim] = {}
        self.states: Dict[str, ClaimProcessingState] = {}
        self.seed()

    def seed(self) -> int:
        """Seed repository with rich preloaded claim scenarios."""
        self.claims.clear()
        self.states.clear()
        preloaded = get_preloaded_claims()
        for claim in preloaded:
            self.claims[claim.id] = claim
        logger.info(f"Seeded {len(self.claims)} preloaded insurance claims into repository.")
        return len(self.claims)

    def get_all(self, line: Optional[str] = None) -> List[Claim]:
        claims_list = list(self.claims.values())
        if line and line.upper() != "ALL":
            claims_list = [
                c for c in claims_list
                if (hasattr(c.insurance_line, "value") and c.insurance_line.value == line.upper())
                or c.insurance_line == line.upper()
            ]
        return claims_list

    def get_by_id(self, claim_id: str) -> Optional[Claim]:
        return self.claims.get(claim_id)

    def save(self, claim: Claim) -> Claim:
        self.claims[claim.id] = claim
        return claim

    def get_state(self, claim_id: str) -> Optional[ClaimProcessingState]:
        return self.states.get(claim_id)

    def save_state(self, claim_id: str, state: ClaimProcessingState) -> ClaimProcessingState:
        self.states[claim_id] = state
        self.claims[claim_id] = state.claim
        return state


# Global in-memory claim store singleton
claim_repo = MemoryClaimRepository()

import io
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from PIL import Image
from PIL.ExifTags import TAGS

logger = logging.getLogger(__name__)


class EXIFAnalyzer:
    """Analyzes image files for metadata tampering, timestamp discrepancies, and editing fingerprints."""

    @staticmethod
    def analyze_image_bytes(
        image_bytes: bytes,
        incident_date_str: Optional[str] = None
    ) -> Dict[str, Any]:
        flags: List[str] = []
        metadata: Dict[str, Any] = {
            "has_exif": False,
            "camera_make": None,
            "camera_model": None,
            "software": None,
            "datetime_original": None,
            "gps_latitude": None,
            "gps_longitude": None,
        }

        try:
            image = Image.open(io.BytesIO(image_bytes))
            exif_data = image.getexif()

            if exif_data:
                metadata["has_exif"] = True
                for tag_id, value in exif_data.items():
                    tag = TAGS.get(tag_id, str(tag_id))

                    if tag == "Make":
                        metadata["camera_make"] = str(value)
                    elif tag == "Model":
                        metadata["camera_model"] = str(value)
                    elif tag == "Software":
                        metadata["software"] = str(value)
                        if any(s in str(value).lower() for s in ["photoshop", "gimp", "canva", "facetune"]):
                            flags.append(f"Image was modified using photo manipulation software: '{value}'.")
                    elif tag == "DateTimeOriginal" or tag == "DateTime":
                        metadata["datetime_original"] = str(value)

                        # Timestamp discrepancy check against incident date
                        if incident_date_str:
                            try:
                                # Normal EXIF date format is YYYY:MM:DD HH:MM:SS
                                photo_dt = datetime.strptime(str(value)[:10].replace(":", "-"), "%Y-%m-%d")
                                incident_dt = datetime.strptime(incident_date_str[:10], "%Y-%m-%d")

                                diff_days = (photo_dt - incident_dt).days
                                if diff_days < -1:
                                    flags.append(f"Photo EXIF creation timestamp ({photo_dt.strftime('%Y-%m-%d')}) predates claimed incident date ({incident_dt.strftime('%Y-%m-%d')}) by {abs(diff_days)} days.")
                                elif diff_days > 45:
                                    flags.append(f"Photo was captured {diff_days} days after the reported incident date.")
                            except Exception as parse_err:
                                logger.debug(f"Date parse error in EXIF: {parse_err}")

                    elif tag == "GPSInfo":
                        metadata["has_gps"] = True

        except Exception as e:
            logger.debug(f"Could not parse EXIF metadata: {e}")

        return {
            "metadata": metadata,
            "forensic_flags": flags
        }

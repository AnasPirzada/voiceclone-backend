import boto3
import logging
from pathlib import Path
from backend.config.s3_config import S3_CONFIG, BUCKET_NAME, S3_PATHS
from backend.config.settings import settings

logger = logging.getLogger(__name__)


class S3Client:
    def __init__(self):
        self._client = boto3.client("s3", **S3_CONFIG)

    def upload_file(self, local_path: str, s3_key: str, content_type: str = "audio/wav") -> str:
        self._client.upload_file(
            local_path, BUCKET_NAME, s3_key,
            ExtraArgs={"ContentType": content_type},
        )
        return self.get_url(s3_key)

    def download_file(self, s3_key: str, local_path: str | None = None) -> str:
        if local_path is None:
            import tempfile
            temp_dir = Path(tempfile.gettempdir()) / "voiceclone_downloads"
            temp_dir.mkdir(parents=True, exist_ok=True)
            local_path = str(temp_dir / s3_key.split("/")[-1])
        Path(local_path).parent.mkdir(parents=True, exist_ok=True)
        self._client.download_file(BUCKET_NAME, s3_key, local_path)
        return local_path

    def get_url(self, s3_key: str) -> str:
        """
        Get a URL for accessing the file.
        
        For Cloudflare R2:
          - If you have a public bucket or custom domain, use direct URL
          - Otherwise use presigned URLs
        
        For MinIO (local dev):
          - Always use presigned URLs
        """
        endpoint = settings.S3_ENDPOINT_URL or ""

        # Cloudflare R2 with public access or custom domain
        if "r2.cloudflarestorage.com" in endpoint:
            # If you set up a custom domain for R2 public access, use it:
            # return f"https://your-custom-domain.com/{s3_key}"
            #
            # Otherwise, generate a presigned URL (works with R2)
            try:
                return self._client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": BUCKET_NAME, "Key": s3_key},
                    ExpiresIn=3600,
                )
            except Exception as e:
                logger.warning(f"Failed to generate presigned URL for R2: {e}")
                # Fallback: construct direct URL (requires public bucket)
                return f"{endpoint}/{BUCKET_NAME}/{s3_key}"
        
        # MinIO / AWS S3 — standard presigned URL
        try:
            return self._client.generate_presigned_url(
                "get_object",
                Params={"Bucket": BUCKET_NAME, "Key": s3_key},
                ExpiresIn=3600,
            )
        except Exception as e:
            logger.warning(f"Failed to generate presigned URL: {e}")
            return f"{endpoint}/{BUCKET_NAME}/{s3_key}"

    def delete_file(self, s3_key: str) -> None:
        self._client.delete_object(Bucket=BUCKET_NAME, Key=s3_key)

    def upload_voice_sample(self, user_id: str, voice_id: str, local_path: str) -> str:
        filename = Path(local_path).name
        s3_key = S3_PATHS["voice_samples"].format(user_id=user_id, voice_id=voice_id) + filename
        return self.upload_file(local_path, s3_key)

    def download_voice_samples(self, user_id: str, voice_id: str) -> list[str]:
        prefix = S3_PATHS["voice_samples"].format(user_id=user_id, voice_id=voice_id)
        result = self._client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix)
        paths = []
        for obj in result.get("Contents", []):
            paths.append(self.download_file(obj["Key"]))
        return paths

    def upload_model(self, user_id: str, voice_id: str, local_path: str) -> str:
        s3_key = S3_PATHS["trained_models"].format(user_id=user_id, voice_id=voice_id) + "model.pth"
        return self.upload_file(local_path, s3_key, content_type="application/octet-stream")

    def download_model(self, user_id: str, voice_id: str) -> str:
        s3_key = S3_PATHS["trained_models"].format(user_id=user_id, voice_id=voice_id) + "model.pth"
        return self.download_file(s3_key)

    def upload_generated_audio(self, user_id: str, job_id: str, local_path: str) -> str:
        filename = Path(local_path).name
        s3_key = S3_PATHS["generated_audio"].format(user_id=user_id, job_id=job_id) + filename
        return self.upload_file(local_path, s3_key)

    def upload_converted_audio(self, user_id: str, job_id: str, local_path: str) -> str:
        filename = Path(local_path).name
        s3_key = S3_PATHS["converted_audio"].format(user_id=user_id, job_id=job_id) + filename
        return self.upload_file(local_path, s3_key)

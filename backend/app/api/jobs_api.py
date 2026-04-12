from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from ..models.job_model import JobCreate, JobApplication
from ..db.firebase import FirebaseDB
from ..utils.security import get_current_user, get_optional_user

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("/")
async def get_jobs(location: str = None, employment_type: str = None):
    jobs = await FirebaseDB.query_collection("jobs", "is_active", "==", True)
    if location:
        jobs = [j for j in jobs if location.lower() in j.get("location", "").lower()]
    if employment_type:
        jobs = [j for j in jobs if j.get("employment_type") == employment_type]
    return sorted(jobs, key=lambda x: x.get("posted_date", ""), reverse=True)

@router.get("/{job_id}")
async def get_job(job_id: str):
    job = await FirebaseDB.get_document("jobs", job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/")
async def create_job(job: JobCreate, user=Depends(get_current_user)):
    data = job.dict()
    data["posted_by"] = user["uid"]
    data["is_active"] = True
    data["applications_count"] = 0
    data["posted_date"] = datetime.utcnow().isoformat()
    job_id = await FirebaseDB.create_document("jobs", data)
    return {"id": job_id, "message": "Job posted successfully"}

@router.post("/{job_id}/apply")
async def apply_to_job(job_id: str, application: JobApplication, user=Depends(get_current_user)):
    job = await FirebaseDB.get_document("jobs", job_id)
    if not job or not job.get("is_active"):
        raise HTTPException(status_code=400, detail="Job not available")
    existing = await FirebaseDB.query_multiple("job_applications", [
        ("jobId", "==", job_id),
        ("applicantId", "==", user["uid"])
    ])
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    data = application.dict()
    data["applicantId"] = user["uid"]
    data["status"] = "applied"
    data["appliedAt"] = datetime.utcnow().isoformat()
    app_id = await FirebaseDB.create_document("job_applications", data)
    await FirebaseDB.update_document("jobs", job_id, {
        "applications_count": job.get("applications_count", 0) + 1
    })
    return {"id": app_id, "message": "Application submitted"}

@router.get("/my/posted")
async def get_my_posted_jobs(user=Depends(get_current_user)):
    return await FirebaseDB.query_collection("jobs", "posted_by", "==", user["uid"])

@router.get("/my/applications")
async def get_my_applications(user=Depends(get_current_user)):
    return await FirebaseDB.query_collection("job_applications", "applicantId", "==", user["uid"])

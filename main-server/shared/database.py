from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
import os
import logging
from datetime import datetime
from typing import Optional
import uuid

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:mysecretpassword@localhost:5432/postgres')

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Task(Base):
    __tablename__ = "Task"
    
    taskId = Column(String, primary_key=True)
    userId = Column(String, nullable=False)
    youtubeUrl = Column(String, nullable=False)
    title = Column(String, nullable=True)
    clipType = Column(String, nullable=True)
    thumbnailUrl = Column(String, nullable=True)
    multipleClips = Column(Boolean, default=False)
    subtitle = Column(Boolean, default=False)
    duration = Column(Integer, nullable=True)
    clipURL = Column(String, nullable=True)
    status = Column(String, default="QUEUED")
    progress = Column(Integer, default=0)
    statusMessage = Column(String, nullable=True)
    errorMessage = Column(String, nullable=True)
    clipsData = Column(JSON, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completedAt = Column(DateTime, nullable=True)

def get_db_session() -> Session:
    return SessionLocal()

def update_task_in_postgres(task_id: str, status: str, progress: int = 0, 
                           message: str = "", result: Optional[dict] = None,
                           user_id: Optional[str] = None) -> bool:
    try:
        db = get_db_session()
        
        task = db.query(Task).filter(Task.taskId == task_id).first()
        
        if task:
            task.status = status
            task.progress = progress
            task.statusMessage = message
            task.updatedAt = datetime.utcnow()
            
            if result:
                task.clipsData = result
                if isinstance(result, dict):
                    zip_url = result.get('zip_s3_url', '')
                    s3_urls = result.get('s3_urls', [])
                    
                    if zip_url and zip_url.strip():
                        task.clipURL = zip_url
                    elif s3_urls and len(s3_urls) > 0:
                        task.clipURL = s3_urls[0]
                
            if status == "COMPLETED":
                task.completedAt = datetime.utcnow()
             
        db.commit()
        logger.info(f"PostgreSQL: Task {task_id} updated successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to update PostgreSQL task {task_id}: {e}")
        if 'db' in locals():
            db.rollback()
        return False
    finally:
        if 'db' in locals():
            db.close()

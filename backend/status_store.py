# Shared task status store
task_status_store = {}

def update_task_status(task_id, status, progress=0, message="", result=None):
    """Update task status in storage"""
    task_status_store[task_id] = {
        "status": status,
        "progress": progress,
        "message": message,
        "result": result
    }

def get_task_status(task_id):
    """Get task status from storage"""
    return task_status_store.get(task_id)

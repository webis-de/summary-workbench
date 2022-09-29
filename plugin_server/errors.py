def validation_exception(exc):
    return {"success": False, "error": "VALIDATION", "errors": exc.errors()}

def general_exception(exc):
    return {"success": False, "error": "APPLICATION", "message": str(exc)}

import hashlib

def make_cache_key(prefix: str, user_ip: str, raw_value: str) -> str:
    hash_input = f"{user_ip}:{raw_value}".encode("utf-8")
    hashed = hashlib.md5(hash_input).hexdigest()
    return f"{prefix}:{hashed}"

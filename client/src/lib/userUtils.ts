const DEFAULT_USER_ID = "guest-user";

export function getUserId(): string {
  let userId = localStorage.getItem("userId");
  
  if (!userId) {
    userId = DEFAULT_USER_ID;
    localStorage.setItem("userId", userId);
  }
  
  return userId;
}

export function initializeUser(): void {
  getUserId();
}

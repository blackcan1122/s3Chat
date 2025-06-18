# TODO

## Features to Add

- [ ] Implement an online users list.
- [ ] Add support for 1:1 (private) chat.
- [ ] Add support for 1:N (group) chats.

## Security Improvements

- [ ] Replace storing passwords in cookies with a secure token or session ID system.
    - After successful login, the backend should return a token (e.g., JWT) or session ID.
    - Store the token/session ID in a cookie (preferably HttpOnly and Secure) or localStorage (less secure).
    - On app load, check for the token/session ID and use it to authenticate with the backend.
    - Remove all logic that stores or reads passwords from cookies.
    - Update backend and frontend to support token/session authentication.

## General

- [ ] Add user feedback for failed login attempts.
- [ ] Rename context variables for clarity (e.g., avoid naming a backend context as AuthContext).
- [ ] Use environment variables for backend URLs instead of hardcoding them.

## Bug Fixes

- [ ] Fix update of Online List when approving or Rejecting
- [ ] Fix Auto Logout Timer

---

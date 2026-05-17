# Soccer Planner Mobile App

A soccer planner app: view groups and matches (users login, view matches, join / unjoin matches)

# Tech Guidelines

- Technologies: React Native + Expo + Expo Router
- Back-end: Soccer Planner RESTful API, with "Bearer token" auth
- Back-end API source code: `..\soccer-web\src\app\api`
- Modular design: split the app into meaningful components, to avoid too much code in a single file and reuse repeating code

# Mobile User Interface Guidelines

- Implement user-friendly UI, stack navigation, responsive layout (for tablets / smartphones)
- Mobile UI Alerts: ensure all native alerts, confirms and other system dialogs have a fallback for Web (implemented as modal popups)
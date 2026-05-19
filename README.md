# Project Description: Soccer Planner
The "Soccer Planner" app is a software product for friends to plan and organize pickup soccer matches.
 - The app holds groups, where matches are organized.
 - Groups have managers and members (invited by managers).
 - Matches are announced in groups and members can join / leave / comment.

## Roles in the App
 - Visitor: can view home page and register in the app.
 - User: can manage own profile, create group, join group.
 - Group member: can view group matches, join / leave a match, comment on match, share match link.
 - Group manager: can create a match, manage matches.
 - Admins (optional): can view / manage all users, groups and matches.

## Visitors
Visitors are anonymous actors who visit the app Web site.
 - Visitors can see the app home page and can register (by email + password) in the app.

## Registered Users
Registered users in the app have a profile with name, email and photo (optional) and can login / logout.
 - Registered users can create groups and join existing groups (by invitation).
 - When user registers a new group, he becomes a group manager for this group.
 - Once an invite link is accepted, a user joins the group and becomes a group member.

## Group Managers
Group managers manage their groups and organize matches.
 - Group managers organize soccer matches in their groups:
    o	Create / edit / cancel / delete matches.
    o	Share match link (copy a shareable match URL).
    o	Matches hold: date, time, location, capacity (number of participants, default 12), canceled (yes/no).
 - Group managers can invite other users to join their groups, by sharing an invite link.
 - Group managers can promote / remove other group members as group managers.
 - Group managers can remove users from their groups.

## Group Members and Matches
Group members can browse matches in their groups: upcoming, current and past matches.
 - Always display the state of each match: upcoming | current | past, note if canceled, full capacity | under capacity | over capacity.
 - A match is upcoming, if its start time is not yet reached. Then, at its start time the match becomes current for 1 hour. After that, the match becomes past.
 - A match can be canceled by a group manager, so it will not be played (for some reason).
 - A match is open to join / unjoin when it is upcoming or current and is not canceled.
 - Display the list of players for the match (group members currently joined).
Group members can join / unjoin a match:
 - Group members can join a match (if not joined yet).
 - Group members can unjoin (leave) a match after joining (optionally, leaving a comment).
 - When joined, a group member can allocate additional slots (bring a friend: +1 / +2 / +3).
 - Don't limit group members to join if a match is full (members will decide how to resolve such situations).
Group members can post comments on matches:
 - Examples: "I am coming 10 mins late", "Can I bring a friend?", "A rain is coming, shall we play?", …
 - Comments are listed after on the match screen.
 - Comments can be edited / deleted by their owner and group managers.

## Web App and Mobile App
 - The Web app is the primary app for this project. It implements entire app functionality: users, group management, group members, match management, etc.
 - The mobile app is additional, scope-limited app, which implements only the most important group member functionality: login / register, view matches, join / unjoin match, comment on match.

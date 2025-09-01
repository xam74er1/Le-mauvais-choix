# Requirements Document

## Introduction

This feature implements "Le mauvais choix" (The Wrong Choice), a real-time multiplayer trivia game where a game master poses questions with correct answers, players submit deceptive fake answers, and then all participants vote on which answer they believe is correct. Players earn points based on how many people vote for their fake answers. The system supports multiple concurrent game sessions with real-time communication via WebSockets, and includes full internationalization support for English and French languages with enhanced animations for a more engaging user experience.

## Requirements

### Requirement 1

**User Story:** As a game master, I want to create a game session and invite players, so that I can host a trivia game with multiple participants.

#### Acceptance Criteria

1. WHEN a user creates a new game session THEN the system SHALL generate a unique session number
2. WHEN a game master shares the session number THEN other users SHALL be able to join using that number and a pseudonym
3. WHEN a game master creates a session THEN the system SHALL designate them as the session owner with special privileges
4. IF a session number is invalid THEN the system SHALL reject the join attempt with an appropriate error message

### Requirement 2

**User Story:** As a player, I want to join a game session with just a session number and pseudonym, so that I can participate in the trivia game without complex registration.

#### Acceptance Criteria

1. WHEN a player enters a valid session number and pseudonym THEN the system SHALL add them to the game session
2. WHEN a player joins a session THEN all existing participants SHALL be notified in real-time via WebSocket
3. IF a pseudonym is already taken in the session THEN the system SHALL reject the join attempt
4. WHEN a player joins THEN the system SHALL display the current game state and participant list

### Requirement 3

**User Story:** As a game master, I want to pose questions with correct answers, so that players can create deceptive alternatives and the game can proceed.

#### Acceptance Criteria

1. WHEN a game master submits a question and correct answer THEN the system SHALL broadcast the question to all players
2. WHEN a question is posed THEN players SHALL have a designated time period to submit their fake answers
3. WHEN the game master submits a question THEN the system SHALL store the correct answer securely
4. IF a game master tries to submit an empty question THEN the system SHALL reject it with validation error

### Requirement 4

**User Story:** As a player, I want to submit a fake answer that looks plausible, so that I can earn points when other players vote for it.

#### Acceptance Criteria

1. WHEN a question is displayed THEN players SHALL be able to submit one fake answer per question
2. WHEN a player submits a fake answer THEN the system SHALL store it without revealing it to other players immediately
3. WHEN the submission period ends THEN the system SHALL compile all fake answers with the correct answer
4. IF a player tries to submit multiple answers THEN the system SHALL only accept the latest submission

### Requirement 5

**User Story:** As a participant, I want to vote on which answer I think is correct from a shuffled list, so that I can try to identify the real answer among the fakes.

#### Acceptance Criteria

1. WHEN all fake answers are collected THEN the system SHALL present a shuffled list of all answers (fake + correct) to all participants
2. WHEN voting begins THEN each participant SHALL be able to vote for exactly one answer
3. WHEN a participant votes THEN the system SHALL record their vote without revealing it to others
4. WHEN all participants have voted OR the game master ends voting THEN the system SHALL proceed to results

### Requirement 6

**User Story:** As a participant, I want to see the voting results and earn points, so that I can track my performance and enjoy the competitive aspect.

#### Acceptance Criteria

1. WHEN voting ends THEN the system SHALL reveal which answer was correct
2. WHEN results are shown THEN the system SHALL display how many votes each answer received
3. WHEN results are calculated THEN players SHALL earn points equal to the number of people who voted for their fake answer
4. WHEN a round ends THEN the system SHALL update and display the current scoreboard

### Requirement 7

**User Story:** As a game master, I want to control the game flow and start new rounds, so that I can manage the pace and continue the game.

#### Acceptance Criteria

1. WHEN a round ends THEN the game master SHALL be able to start a new round with a new question
2. WHEN the game master decides THEN they SHALL be able to end the voting period early
3. WHEN the game master chooses THEN they SHALL be able to end the entire game session
4. WHEN a new round starts THEN all participants SHALL be notified and the interface SHALL reset for new submissions

### Requirement 8

**User Story:** As a participant, I want real-time updates throughout the game, so that I stay synchronized with other players and don't miss any game events.

#### Acceptance Criteria

1. WHEN any game state changes THEN all participants SHALL receive real-time updates via WebSocket
2. WHEN a player joins or leaves THEN all participants SHALL be notified immediately
3. WHEN submissions or votes are made THEN participants SHALL see live progress indicators
4. IF a WebSocket connection is lost THEN the system SHALL attempt to reconnect automatically

### Requirement 9

**User Story:** As a user, I want a modern, responsive, and visually appealing interface, so that I can enjoy the game on any device with smooth interactions.

#### Acceptance Criteria

1. WHEN I access the game on mobile devices THEN the interface SHALL be fully responsive and touch-friendly
2. WHEN game state changes occur THEN the interface SHALL provide smooth animations and visual feedback
3. WHEN I interact with game elements THEN the interface SHALL feel professional and polished
4. WHEN I use the game on different screen sizes THEN all elements SHALL be properly sized and accessible

### Requirement 10

**User Story:** As a game master, I want an improved layout with better controls during voting, so that I can manage the game flow more effectively without participating in voting.

#### Acceptance Criteria

1. WHEN the voting phase begins THEN the game master SHALL see a "End Voting" button instead of voting options
2. WHEN the game master clicks "End Voting" THEN the system SHALL immediately proceed to results phase
3. WHEN displaying the question THEN the game master SHALL see both the question and correct answer prominently at the top
4. WHEN managing the game THEN the game master SHALL have easy access to all controls without scrolling

### Requirement 11

**User Story:** As a user, I want an improved layout with the game ID prominently displayed and better organization of content, so that I can easily share the game and navigate the interface.

#### Acceptance Criteria

1. WHEN I join or create a game THEN the game ID SHALL be displayed prominently in a sidebar or fixed position
2. WHEN viewing game content THEN the question and answer area SHALL be at the top for easy visibility
3. WHEN scrolling through game content THEN important elements SHALL remain accessible without excessive scrolling
4. WHEN the layout changes THEN all game phases SHALL maintain consistent and intuitive organization

### Requirement 12

**User Story:** As a game organizer, I want an automatic game master mode with CSV question management, so that I can run trivia games without needing a human game master.

#### Acceptance Criteria

1. WHEN I upload a CSV file with questions and answers THEN the system SHALL parse and store the trivia questions
2. WHEN I start an automatic game master session THEN the system SHALL automatically pose questions from the CSV file
3. WHEN using automatic mode THEN the system SHALL manage timing, question progression, and scoring without human intervention
4. IF the CSV format is invalid THEN the system SHALL provide clear error messages about required format

### Requirement 13

**User Story:** As a game master, I want a dice feature to randomly select questions, so that I can add spontaneity to the game and edit questions on the fly.

#### Acceptance Criteria

1. WHEN I click the dice button THEN the system SHALL randomly select a question and answer from the available pool
2. WHEN a random question is selected THEN I SHALL be able to edit both the question and answer before presenting it
3. WHEN I edit a randomly selected question THEN the changes SHALL only apply to the current round, not permanently modify the source
4. WHEN using the dice feature THEN the system SHALL ensure no question is repeated within the same game session

### Requirement 14

**User Story:** As a user, I want proper responsive design that uses all available space, so that the interface works well on all devices without overlapping elements.

#### Acceptance Criteria

1. WHEN I use the game on mobile devices THEN elements SHALL NOT overlap and SHALL use the full available screen width
2. WHEN I switch to desktop view THEN the game area SHALL expand to use all available horizontal space effectively
3. WHEN the screen orientation changes THEN the layout SHALL adapt smoothly without breaking element positioning
4. WHEN viewing on different screen sizes THEN all interactive elements SHALL remain accessible and properly sized

### Requirement 15

**User Story:** As a game administrator, I want to manage CSV question files, so that I can maintain and organize different question sets for various game topics.

#### Acceptance Criteria

1. WHEN I access the admin interface THEN I SHALL be able to upload, view, and delete CSV question files
2. WHEN creating a new automatic game THEN I SHALL be able to select from available CSV question sets
3. WHEN viewing CSV files THEN I SHALL see a preview of questions and be able to validate the format
4. WHEN managing question sets THEN I SHALL be able to categorize them by topic or difficulty level

### Requirement 16

**User Story:** As a developer, I want the system to be containerized and easily deployable, so that it can be run consistently across different environments.

#### Acceptance Criteria

1. WHEN the system is deployed THEN it SHALL run in Docker containers for both frontend and backend
2. WHEN containers are started THEN the FastAPI backend SHALL serve the API and WebSocket endpoints
3. WHEN containers are running THEN the React frontend SHALL communicate with the backend via HTTP and WebSocket
4. WHEN the system starts THEN all necessary dependencies SHALL be installed and configured automatically

### Requirement 17

**User Story:** As a user, I want the application to be called "Le mauvais choix" and support both English and French languages, so that I can play the game in my preferred language.

#### Acceptance Criteria

1. WHEN I access the application THEN the title SHALL display "Le mauvais choix" prominently
2. WHEN I view the interface THEN I SHALL see a language selector in the corner of the screen
3. WHEN I select English or French THEN all interface text SHALL immediately update to the selected language
4. WHEN I refresh the page THEN my language preference SHALL be remembered and maintained
5. WHEN game content is displayed THEN all labels, buttons, and messages SHALL be properly translated

### Requirement 18

**User Story:** As a user, I want enhanced animations and visual feedback throughout the game, so that interactions feel more engaging and fun.

#### Acceptance Criteria

1. WHEN a new player joins the game THEN the interface SHALL show a smooth animated notification
2. WHEN game phases change THEN the transition SHALL include engaging animations
3. WHEN I submit answers or votes THEN the interface SHALL provide immediate animated feedback
4. WHEN scores update THEN the changes SHALL be highlighted with smooth animations
5. WHEN any interaction occurs THEN the interface SHALL feel responsive and lively with appropriate animations

### Requirement 19

**User Story:** As a user, I want the game interface to display "Le mauvais choix" as the application name throughout the experience, so that the branding is consistent and clear.

#### Acceptance Criteria

1. WHEN I view the main menu THEN "Le mauvais choix" SHALL be displayed as the primary title
2. WHEN I am in a game session THEN "Le mauvais choix" SHALL remain visible in the header or sidebar
3. WHEN I share the game with others THEN the application name SHALL be "Le mauvais choix"
4. WHEN viewing any game phase THEN the branding SHALL be consistent and prominent
# Test Plan Document

- [IDENTIFICATION INFORMATION](#identification-information)
    - [PRODUCT](#product)
    - [PROJECT DESCRIPTION](#project-description)
- [UNIT TEST](#unit-test)
    - [UNIT TEST STRATEGY](#unit-test-strategy)
- [REGRESSION TEST](#regression-test)
    - [REGRESSION TEST STRATEGY](#regression-test-strategy)
- [INTEGRATION TEST](#integration-test)
    - [INTEGRATION TEST STRATEGY](#integration-test-strategy)
    - [INTEGRATION TEST CASES](#integration-test-cases)
- [E2E TESTS](#e2e-tests)
    - [USER ACCEPTANCE TEST STRATEGY](#e2e-test-strategy)
    - [USER ACCEPTANCE TEST CASES](#e2e-test-cases)

## IDENTIFICATION INFORMATION

### PRODUCT

- **Product Name:** FriendsQuest
- **Product Type:** Mobile Application
- **Product Part:** API (Backend)

### PROJECT DESCRIPTION

Travel the world and capture the most special moments as footprints on your globe. Follow the footprints of your friends and react on their memories. USE CASE you are too far away to see what's behind the footprint just listen to the sounds behind the memory.

## UNIT TEST

### UNIT TEST STRATEGY

Evaluate new features and bug fixes introduced for each new release.

{{ missing information }}

## REGRESSION TEST

Ensure that previously developed and tested software still performs after change.

### REGRESSION TEST STRATEGY

Evaluate all tests/reports introduced in the previous releases.

## INTEGRATION TEST

Combine individual software modules and test as a group.

### INTEGRATION TEST STRATEGY

Evaluation of the integration between the routers, controllers and repositories.

### INTEGRATION TEST CASES

## E2E TESTS

Verification that new features work for the end-user.

### E2E TEST STRATEGY

The E2E tests are executed manually.

After a pull request into `develop` was closed successfully the api will be deployed to the staging environment. The staging environment is used to test the api with the frontend.

Currently, the E2E tests are executed locally with different virtual devices in Android Studio and Xcode using the "dev" branch of the frontend.

The beta programm of the different App Stores will be used in the near future to connect to the staging environment and run the E2E Tests. 

### E2E TEST CASES

All the test cases are written for the English UI (so labels might differ for other languages).

#### Account

| #1.1                | User Registration: Successful                                                                                                 |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **USE CASE**        | User wants to register                                                                                                        |
| **PRE-CONDITION**   | App has never be opened                                                                                                       |
| **POST-CONDITION**  | User will be logged in automatically after registration and sees the Onboarding-Tour                                          |
| **STEPS**           | 1. User opens App and clicks on "sign up now"<br/>2. User inputs `username`, `email`, `password`<br/>3. User clicks "sign up" |

| #1.2               | User Registration: Unsuccessful                                                                                                                                                         |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **USE CASE**       | User wants to register                                                                                                                                                                  |
| **PRE-CONDITION**  | App has never be opened                                                                                                                                                                 |
| **POST-CONDITION** | Error is shown about registration error (e.g. email or username already used, password strength to weak                                                                                 |
| **STEPS**          | 1. User opens App and clicks on "sign up now"<br/>2. User inputs "test@test.at" as `email`<br/>3. User inputs not used `username` and strong `password`<br/>3. User clicks on "sign up" |

| #2.1               | User Login: Invalid credentials                                                             |
|--------------------|---------------------------------------------------------------------------------------------|
| **USE CASE**       | User wants to login                                                                         |
| **PRE-CONDITION**  | User has account                                                                            |
| **POST-CONDITION** | Error is shown about invalid credentials                                                    |
| **STEPS**          | 1. User opens App<br/>2. User enters invalid account credentials<br/>3. User clicks "login" |

| #2.2               | User Login: Valid credentials                                                             |
|--------------------|-------------------------------------------------------------------------------------------|
| **USE CASE**       | User wants to login                                                                       |
| **PRE-CONDITION**  | User has account                                                                          |
| **POST-CONDITION** | User sees main screen with globe and available footprints are shown                       |
| **STEPS**          | 1. User opens App<br/>2. User enters valid account credentials<br/>3. User clicks "login" |

| #3                  | Delete User Data                                                                                                                                               |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **USE CASE**        | User wants to delete account                                                                                                                                   |
| **PRE-CONDITION**   | User is on main screen (globe)                                                                                                                                 |
| **POST-CONDITION**  | App shows login screen                                                                                                                                         |
| **STEPS**           | 1. User clicks "profile" button in tab bar<br/>2. User clicks "menu" button<br/>3. User clicks "Delete account" button<br/>4. User confirms deletion in pop-up |

#### Footprints

| #4                  | Create Footprint                                                                                                                                                                                                                                                                             |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **USE CASE**        | User wants to create footprint                                                                                                                                                                                                                                                               |
| **PRE-CONDITIONS**  | - User is on main screen (globe)<br/>- User has GPS activated<br/>- User has granted location and camera permissions                                                                                                                                                                         |
| **POST-CONDITION**  | Modal is shown with animation                                                                                                                                                                                                                                                                |
| **STEPS**           | 1. User clicks "+"-button<br/>2. User clicks "Add footprint" button<br/>3. User takes picture<br/>4. User accepts taken picture<br/>5. User enters `title` and `description`<br/>6. User clicks "checkmark"-button<br/>7. User listens to audio<br/>8. User clicks "double checkmark"-button |

| #5                  | View Footprint                                                                                                                                                             |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **USE CASE**        | User wants to view detailed view of a footprint and react to it                                                                                                            |
| **PRE-CONDITION**   | - User is on main screen (globe)<br/>- User has GPS activated<br/>- User is near a footprint                                                                               |
| **POST-CONDITION**  | /                                                                                                                                                                          |
| **STEPS**           | 1. User clicks on footprint<br/>2. User plays audio<br/>3. User opens detail view (clicks on arrow)<br/>4. User clicks "+"-button<br/>5. User inputs reaction and sends it |

#### Friends

| #6                  | Create new Friendship                                                                       |
|---------------------|---------------------------------------------------------------------------------------------|
| **USE CASE**        | User wants to add another user as a friend                                                  |
| **PRE-CONDITION**   | User is on friend screen                                                                    |
| **POST-CONDITION**  | Friend request is shown under "pending" section                                             |
| **STEPS**           | 1. User clicks on add button<br/>2. User inputs friends code<br/>3. User clicks "checkmark" |

| #7                 | Accept Friendship                                             |
|--------------------|---------------------------------------------------------------|
| **USE CASE**       | User wants to accept friend request                           |
| **PRE-CONDITION**  | - User is on friends screen<br/>- User has pending invitation |
| **POST-CONDITION** | New friend is shown in "Friends" section                      |
| **STEPS**          | 1. User clicks "checkmark" of the friend request              |

#### Leaderboard

| #8                  | View Leaderboard                   |
|---------------------|------------------------------------|
| **USE CASE**        | User wants to see the leaderboard  |
| **PRE-CONDITION**   | User is on the main screen (globe) |
| **POST-CONDITION**  | Leaderboard is shown               |
| **STEPS**           | 1. User clicks on "trophy" icon    |

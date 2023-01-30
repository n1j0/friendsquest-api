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
- [Appendix](#appendix)

## IDENTIFICATION INFORMATION

### PRODUCT

- **Product Name:** FriendsQuest
- **Product Type:** Mobile Application
- **Product Part:** API (Backend)

### PROJECT DESCRIPTION

Travel the world and capture the most special moments as footprints on your globe. Follow the footprints of your friends and react on their memories. When you are too far away to see what's behind the footprint just listen to the sounds behind the memory.

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

Evaluate all integrations with locally developed shared libraries, with consumed services, and other touch points.

### INTEGRATION TEST CASES

## E2E TESTS

Verify that the solution works for the end-user.

### E2E TEST STRATEGY

{Explain how user acceptance testing will be accomplished}

### E2E TEST CASES

All the test cases are written for the English UI (so labels might differ for other languages).

#### Account

| #1.1               | User Registration: Successful                                                         |
|--------------------|---------------------------------------------------------------------------------------|
| **WHEN**           | User opens App and clicks on "sign up now"                                            |
| **PRE-CONDITION**  | /                                                                                     |
| **POST-CONDITION** | User will be logged in automatically after registration and sees the Onboarding-Tour  |
| **THEN**           | 1. User inputs `username`, `email`, `password`<br/>2. User clicks "sign up"           |

| #1.2               | User Registration: Unsuccessful                                                                                                       |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| **WHEN**           | User opens App and clicks on "sign up now"                                                                                            |
| **PRE-CONDITION**  | /                                                                                                                                     |
| **POST-CONDITION** | Error is shown about registration error (e.g. email or username already used, password strength to weak                               |
| **THEN**           | 1. User inputs "test@test.at" as `email`<br/>2. User inputs not used `username` and strong `password`<br/>3. User clicks on "sign up" |

| #2.1               | User Login: Invalid credentials                                       |
|--------------------|-----------------------------------------------------------------------|
| **WHEN**           | User opens App                                                        |
| **PRE-CONDITION**  | User has account                                                      |
| **POST-CONDITION** | Error is shown about invalid credentials                              |
| **THEN**           | 1. User enters invalid account credentials<br/>2. User clicks "login" |

| #2.2               | User Login: Valid credentials                                       |
|--------------------|---------------------------------------------------------------------|
| **WHEN**           | User opens App                                                      |
| **PRE-CONDITION**  | User has account                                                    |
| **POST-CONDITION** | User sees main screen with globe and available footprints are shown |
| **THEN**           | 1. User enters valid account credentials<br/>2. User clicks "login" |

| #3                 | Delete User Data |
|--------------------|------------------|
| **WHEN**           ||
| **PRE-CONDITION**  ||
| **POST-CONDITION** ||
| **THEN**           ||

#### Footprints

| #4                 | Create Footprint |
|--------------------|------------------|
| **WHEN**           ||
| **PRE-CONDITION**  ||
| **POST-CONDITION** ||
| **THEN**           ||

| #5                 | View Footprint |
|--------------------|----------------|
| **WHEN**           ||
| **PRE-CONDITION**  ||
| **POST-CONDITION** ||
| **THEN**           ||

#### Friends

| #6                 | Create new Friendship |
|--------------------|-----------------------|
| **WHEN**           ||
| **PRE-CONDITION**  ||
| **POST-CONDITION** ||
| **THEN**           ||

| #7                 | Accept Friendship |
|--------------------|-------------------|
| **WHEN**           ||
| **PRE-CONDITION**  ||
| **POST-CONDITION** ||
| **THEN**           ||

#### Leaderboard

| #8                 | View Leaderboard |
|--------------------|------------------|
| **WHEN**           ||
| **PRE-CONDITION**  ||
| **POST-CONDITION** ||
| **THEN**           ||

## Appendix

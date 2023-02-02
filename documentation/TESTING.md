# Test Plan Document

## TESTING TOOLS

### GENERAL

#### SENTRY

In order to track errors and crashes we use [Sentry](https://sentry.io/). It is used in the Flutter App (frontend) and the Express API (backend).

### BACKEND

#### LINTING

The backend is linted with [ESLint](https://eslint.org/). The linting rules are defined in the `.eslintrc.cjs` file.

#### TYPECHECK

Around 97 % of the code is written in TypeScript. We use "tsc" in order to check our files and compile them to js.

#### PRE-COMMIT HOOK

Before a commit all staged files will be analyzed with ESLint, tsc and all related tests will be executed. If any of the steps fails, the developer is not able to make a commit.

This "prevents" general "bad" static code in the repository.

#### JEST

We use "jest" to write our tests. For easier mocking "jest-mock-extended" is just. This library accepts classes / interfaces and automatically creates mocks.

#### SUPERTEST

The integration tests are written with "supertest". This module provides a high-level abstraction for testing APIs (HTTP) and integrates perfectly into "jest".

#### CODE COVERAGE

The code coverage is measured with the default "jest" reporter. The coverage is measured with the `npm run test:coverage` command.

The coverage report combines unit and integration test coverage. In the presentation the reports are shown separately and in combination.

We are excluding some directories / files from the coverage report within the "./src" folder. These are:

| directory / file              | reason                                                                                             |
|-------------------------------|----------------------------------------------------------------------------------------------------|
| admin                         | is just for developers and therefor wasn't prioritised for tests                                   |
| docs                          | includes just a config file for swagger                                                            |
| entities, migrations, seeders | mikro-orm related "helper" files                                                                   |
| index.ts                      | node entry point                                                                                   |
| router/_firebaseAuth.ts       | this route is for developers in the swagger docs and is not used by end-users (password protected) |

#### SonarCloud

We use SonarCloud to check our code for several issues (security issues, code smells, bugs, vulnerabilities).

#### Stryker

In order to check if our Unit Tests are well written, we're using [stryker](https://stryker-mutator.io/). This tool mutates the original code and checks if the corresponding tests will fail. If they still succeed, the mutant wasn't killed and the test itself seems to be not that good.

### FRONTEND

#### Linting

For static code analysis we use the `flutter analyze` command. The linting config is specified in `analysis_options.yaml` (frontend).

#### test 

For unit tests we use the Flutter [test](https://pub.dev/packages/test) package.

#### flutter_test

For widget tests (UI) we use the Flutter [flutter_test](https://api.flutter.dev/flutter/flutter_test/flutter_test-library.html) package.

#### Mockito

For generating mocks we use the Flutter [mockito](https://pub.dev/packages/mockito) package.

#### Code coverage

The code coverage is measured with the following command: 
```
flutter test --coverage
```

The resulting coverage report combines unit and widget tests. It is generated with the following command: 
```
lcov --remove coverage/lcov.info 'lib/api/*' 'lib/exceptions' 'lib/app/*'  'lib/theme/*' 'lib/packages/*' 'lib/screens/_root/*' 'lib/screens/image_viewer/*' 'lib/screens/imprint/*' 'lib/screens/onboarding/*' 'lib/screens/about/*' 'lib/screens/home/*' 'lib/screens/home_my_profile/*' 'lib/services/*' 'lib/exceptions/*' 'lib/widgets/globe_map.dart' 'lib/screens/footprint_create/footprint_create_camera_screen_controller.dart' 'lib/screens/footprint_create_screen.dart' 'lib/screens/privacy/*' -o coverage/exclude_lcov.info
```

A HTML representation of the report is generated with:
```
genhtml coverage/exclude_lcov.info -o coverage/html
open coverage/html/index.html
``` 

We are excluding some directories / files from the coverage report within the "lib" folder. These are:

| directory / file              | reason                                                                                             |
|-------------------------------|----------------------------------------------------------------------------------------------------|
| api/                         | contains just a wrapper for the Dart `http` package         |
| app/                          | contains just config, constants, and routing information/logic                                                            |
| exceptions/ | contains just pure Exception classes (no logic)                                                                    |
| theme/                      | contains just colors, button styles, text styles, etc.                                                        
| services/       | contains just interfaces and their implementation (which are just wrappers for packages and device features such as camera, etc.) |
| screens/_root/       | not much code but hard to test |
| screens/image_viewer/       | no logic |
| screens/imprint/       | no logic |
| screens/onboarding/       | no logic |
| screens/about/       | no logic |
| screens/home/       | not much code but hard to test |
| screens/home_my_profile/       | ??? |
| screens/privacy/       | no logic |
| screens/footprint_create/footprint_create_camera_screen_controller.dart       | very hard to test, because it uses the device camera |
| widgets/globe_map.dart       | not testable (due to HTTP requests) |

## PIPELINE

### BACKEND

The pipeline includes several steps:

1. npm install
2. running ESLint
3. running typecheck
4. running ALL unit and integration tests
5. coverage report uploading (as artifact)
6. showing summarized coverage report as GitHub comment for pull requests

The steps 2 to 4 could run in parallel. But it's faster when they're running in sequence due to the amount of times it takes to upload the node_modules artifact / cache and download it for each step.

These steps will be performed for every push to "feature/*" branches and "develop". Moreover, each pull request for develop or main triggers these steps, too.

For every pull request and every push to "develop" SonarCloud starts to analyze the new code and adds a comment to the pull request regarding the quality of the newly written code.

If every step was successful, it's possible to merge a pull request.

After merging, the deployment process / pipeline starts automatically:

1. Setting up SSH
2. Pushing to server
   1. Pushing to staging system (if branch "develop")
   2. Pushing to production system (if branch "main")

Stryker has its own manual pipeline. This pipeline can be started manually for every branch within the GitHub Actions tab. The process takes a very long time (around 20-30 minutes). Right now, the report can be downloaded from the GitHub artifacts and is not accessible via a URL.

A pull request to the "main" branch is just performed for a new releases.

Before we create a new release branch we manually execute our [E2E Tests](#e2e-tests) just after the deployment to our staging system was successful. Only if all the tests are successful we create a new release.

So the manual tests are kind of part of our pipeline.

### FRONTEND

We use [Codemagic](https://codemagic.io/start/) as CI/CD tool. 

![Pipeline Frontend](/documentation/pipeline-frontend.png)

The pipeline includes several steps:

1. Fetching app sources: fetches the source code from our GitLab
2. Setup code signing identities: keys and secrets required to sign the app for Android
3. Installing dependencies: installs all dependencies 
4. Testing: performs static code analysis and executes all unit and widget tests 
5. Building Android: builds the app bundle
6. Publishing: publishes the app in the Google Play Store

The pipeline is triggered each time code is committed or merged into the `main` branch. 

## UNIT TEST

### UNIT TEST STRATEGY

Evaluate new features and bug fixes introduced for each new release.

Generally, we tried to write as much unit tests as possible so the underlying code base for integration tests was well covered.

The backend uses unit tests to test logical behaviour of classes / modules / components. All unit tests are located in the [tests/unit](../tests/unit) folder.

The frontend uses unit tests to test logical behaviour as well as UI-related components (widgets). The unit tests are located in the [test](https://gitlab.mediacube.at/fhs47806/friendsquest/-/tree/main/test) folder.

## REGRESSION TEST

Ensure that previously developed and tested software still performs after change.

### REGRESSION TEST STRATEGY

Evaluation of all tests of the previous releases.

Mostly done in our pipelines and pre-commit hook. E2E Tests, as stated, manually. 

## INTEGRATION TEST (only backend)

### INTEGRATION TEST STRATEGY

Evaluation of the integration between the routers, middlewares, controllers, services and repositories. You can find the integration tests in the [tests/integration](../tests/integration) folder.

Keep in mind that the integration tests are not testing the database. The database is mocked.

### INTEGRATION TEST CASES

{missing}

## E2E TESTS

Verification that new features work for the end-user.

### E2E TEST STRATEGY

The E2E tests are executed manually.

After a pull request into `develop` was closed successfully the api will be deployed to the staging environment. The staging environment is used to test the api with the frontend.

Currently, the E2E tests are executed locally with different virtual devices in Android Studio and Xcode using the "dev" branch of the frontend.

The beta programm of the different App Stores will be used in the near future to connect to the staging environment and run the E2E Tests on real devices.

### E2E TEST CASES

All the test cases are written for the English UI (so labels might differ for other languages).

**Note:** The test cases are written for the current state of the app. The test cases will be updated accordingly.

**ATTENTION:** For every test case the user has to be online. If the user is offline the app cannot be used.

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

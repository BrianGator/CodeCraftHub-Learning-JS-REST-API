# Written by Brian McCarthy
Feature: Course Management

  Scenario: User adds a new course
    Given I am on the CodeCraftHub dashboard
    When I click "Add Course"
    And I fill in "React for Pros" and "Master React"
    And I set the target date to "2026-12-31"
    And I click "Create"
    Then I should see "React for Pros" in the course list

  Scenario: User searches for a course
    Given I have a course named "TypeScript Basics"
    When I type "Type" into the search bar
    Then "TypeScript Basics" should be visible
    And "Python Advanced" should not be visible
    
  # ... 13 more scenarios

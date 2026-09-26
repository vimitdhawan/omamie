## ADDED Requirements

### Requirement: Admin can view open contact messages

The system SHALL allow a signed-in admin to view all contact messages with status `open`, ordered by most recent first, with no date restriction.

#### Scenario: Admin opens the contact messages page

- **WHEN** an admin navigates to the Contact Messages page
- **THEN** every message with status `open` is shown, regardless of how old it is

#### Scenario: Non-admin is denied

- **WHEN** a signed-in tenant or owner requests the contact messages list
- **THEN** the request is rejected with a forbidden error

### Requirement: Admin can resolve an open message

The system SHALL allow an admin to mark an `open` contact message as `completed` by providing a non-empty resolution note. This transition is one-way: a `completed` message cannot be reopened, and completing an already-completed message SHALL fail.

#### Scenario: Admin completes a message with a reason

- **WHEN** an admin submits a non-empty resolution note for an open message
- **THEN** the message's status becomes `completed`, and its resolution note and resolved timestamp are recorded

#### Scenario: Admin submits an empty reason

- **WHEN** an admin attempts to complete a message without a resolution note
- **THEN** the request is rejected and the message remains `open`

#### Scenario: Admin attempts to complete an already-completed message

- **WHEN** an admin attempts to complete a message whose status is already `completed`
- **THEN** the request fails and no fields are changed

### Requirement: Admin can view completed messages within a bounded date range

The system SHALL allow an admin to view `completed` contact messages only by supplying an explicit date range, and SHALL reject any range whose span exceeds three months (92 days).

#### Scenario: Admin requests a valid range

- **WHEN** an admin requests completed messages for a date range spanning 60 days
- **THEN** completed messages whose resolution falls within that range are returned

#### Scenario: Admin requests an oversized range

- **WHEN** an admin requests completed messages for a date range spanning more than 92 days
- **THEN** the request is rejected and no messages are returned

#### Scenario: Admin omits the date range

- **WHEN** an admin requests completed messages without supplying a date range
- **THEN** the request is rejected

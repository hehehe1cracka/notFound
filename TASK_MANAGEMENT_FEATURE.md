# Task Management Feature - Complete Workflow

## Overview
Added a comprehensive task management system that allows users to claim tasks, submit work, and enables founders to review submissions with integrated chat functionality.

## New Features

### 1. **Task Detail Dialog** (`TaskDetailDialog.tsx`)
A full-featured dialog component with 4 tabs:

#### Tab 1: Details
- View complete task information
- See deadline, priority, assigned user, and tags
- Claim open tasks (for talent/contributors)
- Shows task status and XP rewards

#### Tab 2: Submit Work
- **For assigned users only**
- Submit work description (required)
- Add multiple attachment links (GitHub, Figma, Drive, etc.)
- Visual feedback for submission status
- Automatically updates task status to "submitted"

#### Tab 3: Submissions
- View all submissions for the task
- **For Founders:**
  - Review submissions with approve/reject actions
  - Add review comments
  - Approve: Marks task as completed, awards XP to contributor
  - Reject: Sends feedback to contributor
- **For Contributors:**
  - See submission status (pending, approved, rejected)
  - View founder's review comments

#### Tab 4: Chat
- Real-time task-specific chat
- All task participants can communicate
- Messages auto-scroll to latest
- Timestamps for all messages
- Differentiated message bubbles (sender vs receiver)

### 2. **Updated StartupProfile Page**
- Integrated TaskDetailDialog
- Click any task card to open detailed view
- Seamless workflow from task discovery to completion

## User Workflows

### For Contributors/Talent:

1. **Discover Tasks**
   - Browse tasks in the startup's Tasks tab
   - See open, in-progress, and completed tasks
   - Filter by status using the kanban board

2. **Claim a Task**
   - Click on an open task
   - Click "Claim This Task" button
   - Task status changes to "in_progress"
   - You're now assigned to the task

3. **Submit Work**
   - Go to "Submit" tab in task dialog
   - Describe your work in detail
   - Add links to your deliverables (GitHub PRs, Figma designs, etc.)
   - Click "Submit Work"
   - Task status changes to "submitted"

4. **Communicate**
   - Use the "Chat" tab to ask questions
   - Discuss requirements with founder
   - Get clarifications in real-time

5. **Get Reviewed**
   - Wait for founder review in "Submissions" tab
   - See approval status and feedback
   - Earn XP when approved!

### For Founders:

1. **Create Tasks**
   - Click "Add Task" button
   - Provide title and description
   - Task appears in the "Open" column

2. **Monitor Progress**
   - See tasks move through statuses
   - Check who's working on what
   - View submission notifications

3. **Review Submissions**
   - Click on submitted tasks
   - Go to "Submissions" tab
   - Review work and attachments
   - Add comments (optional)
   - **Approve:** Task completes, contributor gets XP
   - **Reject:** Send back with feedback

4. **Communicate**
   - Answer questions in task chat
   - Provide guidance and clarification
   - Build relationships with contributors

## Technical Implementation

### Data Structure

**Task with Submissions:**
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'submitted' | 'completed';
  assignedTo?: string;
  assignedToName?: string;
  submissions: [
    {
      id: string;
      userId: string;
      userName: string;
      content: string;
      attachments: string[];
      status: 'pending' | 'approved' | 'rejected';
      reviewComment?: string;
      createdAt: number;
    }
  ];
  xpReward?: number;
  deadline?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
```

**Chat Messages:**
```typescript
{
  id: string;
  contextType: 'task';
  contextId: string; // task ID
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}
```

### Firebase Paths
- Tasks: `/tasks/{startupId}/{taskId}`
- Task Chats: `/taskChats/{taskId}/{messageId}`
- User XP: `/users/{userId}/xp`
- User Tasks Completed: `/users/{userId}/tasksCompleted`

### Real-time Updates
- Chat messages use Firebase `onValue` listener for real-time updates
- Submissions update automatically when founder reviews
- Task status changes reflect immediately

## Benefits

1. **Transparency:** All work submissions are timestamped and permanent
2. **Trust Building:** Contributors build reputation through completed tasks
3. **Communication:** Built-in chat reduces friction
4. **Gamification:** XP rewards motivate quality work
5. **Accountability:** Clear review process with feedback
6. **Simplicity:** Everything in one dialog - no context switching

## Next Steps

Future enhancements could include:
- File upload support (not just links)
- Task templates for common work types
- Automated deadline reminders
- Task difficulty ratings
- Skill-based task recommendations
- Submission versioning (revisions)
- Multi-reviewer support
- Task analytics dashboard

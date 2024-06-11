export enum ChatStatus {
  ACTIVE = 'Active',         // Chat is active and agents are available.
  INACTIVE = 'Inactive',     // Chat is inactive, no agents are available.
  PENDING = 'Pending',       // Chat request is pending, waiting for an agent to respond.
  CLOSED = 'Closed',         // Chat has been closed by either the user or the agent.
  BUSY = 'Busy',             // All agents are currently busy; user is in queue.
}


export enum ChatTopic {
  OTHER = 'Other',
  PAYMENT = 'Payment problems',
  FUNCTIONALITY = 'Problems with service functionality',
  ACCOUNT = 'Account issues',
  USAGE = 'Usage',
  BUG_REPORT = 'Bug reports'
}

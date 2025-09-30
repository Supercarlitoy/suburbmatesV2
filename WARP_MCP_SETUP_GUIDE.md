# Warp MCP Setup Guide - SuburbMates Project

## 🎯 Setting Up MCP Servers in Warp Terminal

This guide will help you configure Model Context Protocol (MCP) servers specifically for **Warp Terminal** to enhance your SuburbMates development workflow.

## 📋 Step-by-Step Setup Instructions

### Step 1: Access Warp MCP Settings

You can navigate to MCP server settings in Warp using any of these methods:

**Option A: From Warp Drive**
1. Open Warp Drive (Cmd+Shift+D or click the drive icon)
2. Navigate to Personal > MCP Servers

**Option B: From Command Palette**
1. Open Command Palette (Cmd+Shift+P)
2. Search for "Open MCP Servers"

**Option C: From Settings**
1. Open Settings (Cmd+,)
2. Navigate to AI > Manage MCP servers

### Step 2: Add Multiple MCP Servers

1. In the MCP Servers page, click the **"+ Add"** button
2. Select **"Multiple MCP Servers (JSON)"**
3. Copy and paste the configuration below:

```json
{
  "mcpServers": {
    "suburbmates-filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/carlg/Documents/PROJECTS/suburbmates"],
      "working_directory": "/Users/carlg/Documents/PROJECTS/suburbmates"
    },
    "suburbmates-postgres": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://postgres:November281986.@db.mefqaulxkqiriljwemvx.supabase.co:5432/postgres?schema=public"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:November281986.@db.mefqaulxkqiriljwemvx.supabase.co:5432/postgres?schema=public"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sequential-thinking": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_3eAIBiu6wiyhrvyXPYQ8FFnH0yDUbt01lWK"
      }
    }
  }
}
```

4. Click **"Add Servers"** to save the configuration

### Step 3: Start MCP Servers

1. After adding the servers, you'll see them listed in the MCP Servers page
2. Click the **"Start"** button for each server you want to activate
3. Warp will automatically install the required packages using npx

### Step 4: Verify Server Status

Each running server should show:
- ✅ Green status indicator
- List of available tools and resources
- No error messages in the logs

## 🔧 MCP Server Descriptions

### 1. **SuburbMates Filesystem** 
- **Purpose**: Direct access to your project files and documentation
- **Path**: `/Users/carlg/Documents/PROJECTS/suburbmates`
- **Tools**: Read/write files, browse directories, access documentation

### 2. **SuburbMates PostgreSQL**
- **Purpose**: Direct database queries for your Supabase instance
- **Database**: Your live SuburbMates database
- **Tools**: Query businesses, claims, analytics, quality scores

### 3. **Memory Server**
- **Purpose**: Persistent knowledge graph for project context
- **Tools**: Store/retrieve project decisions, patterns, progress

### 4. **Sequential Thinking**
- **Purpose**: Enhanced reasoning for complex development tasks
- **Tools**: Multi-step problem solving, architecture planning

### 5. **GitHub Integration**
- **Purpose**: Repository management and collaboration
- **Tools**: Create issues, PRs, access repository data

## 🚀 Using MCP Servers in Warp

Once configured and running, you can use the MCP servers by:

### **In Agent Conversations:**
```
"Query all PENDING businesses from the database"
"Show me the admin components in the filesystem"
"Remember: we're implementing bulk approval features"
"Help me analyze lead conversion by suburb"
```

### **With @ Context:**
- Use `@suburbmates-filesystem` to reference project files
- Use `@suburbmates-postgres` for database queries
- Use `@memory` to recall previous decisions

## 🔍 SuburbMates-Specific Use Cases

### **Admin Panel Development (70.5% → 100%)**
```
Ask me: "Query businesses by approval status and show admin components"
Ask me: "Help implement bulk approval with audit logging"
Ask me: "Access quality scoring algorithm and suggest improvements"
```

### **Business Directory Management**
```
Ask me: "Show ABN verification rates from database"
Ask me: "Access CLI tools and explain deduplication logic" 
Ask me: "Query Melbourne suburbs and business categories"
```

### **Analytics & Optimization**
```
Ask me: "Analyze lead generation performance by suburb"
Ask me: "Show shareable profile conversion tracking"
Ask me: "Query GA4 events and PostHog data patterns"
```

## ⚙️ Troubleshooting

### If a server fails to start:
1. Click **"View Logs"** to see error details
2. Check that all dependencies are available (npx installs automatically)
3. Verify environment variables are correct
4. Restart the server after fixing issues

### For database connection issues:
1. Verify your Supabase database is accessible
2. Check the connection string format
3. Ensure network connectivity

### For filesystem access issues:
1. Verify the project path exists
2. Check file permissions for the directory
3. Ensure working_directory is set correctly

## 🔒 Security Notes

- GitHub token is configured from your existing `.env.local`
- Database connection uses your existing Supabase credentials
- All MCP servers run locally and don't send data externally
- Logs may contain sensitive information - review before sharing

## 📊 Expected Results

After setup, you'll have enhanced capabilities for:

- **Direct database access**: Query 603+ Melbourne businesses, claims, analytics
- **Comprehensive file access**: All documentation, components, CLI tools
- **Persistent memory**: Project context, decisions, implementation progress
- **Enhanced reasoning**: Complex development task assistance
- **GitHub integration**: Repository management and collaboration

## ✅ Verification Checklist

- [ ] All 5 MCP servers added to Warp
- [ ] Servers show green status (running)
- [ ] No errors in server logs
- [ ] Can query database through agent
- [ ] Can access project files through agent
- [ ] Memory server remembers context
- [ ] GitHub integration working

---

**Next Steps**: Start using the enhanced agent capabilities to accelerate your SuburbMates development! 🚀

## 🎯 Quick Test Commands

Try these in a new agent conversation:

```
"Show me all businesses with PENDING approval status from the database"
"Access the admin dashboard components and explain the current architecture" 
"Remember: SuburbMates is 70.5% complete with 110/156 subtasks done"
"Help me plan the remaining 29.5% of implementation tasks"
```
## Use Case 3: "Enforce team standards and make Copilot understand them. Also, delegate tasks to a custom Agent"

### **Scenario 1:**  Your company uses an internal observability framework (TAO). New developers keep forgetting to add proper logging/metrics.  Beyond that, they continue to miss compliance requirements which delay releases.

**Your Challenge:** Encode team standards so Copilot enforces them automatically.

One of the most powerful features of Copilot is **Custom Instructions**.  These allow you to define rules that Copilot applies automatically based on file path, type, or other criteria.  This allows you to tune Copilot to your specific needs.  As an example, it's one thing to be an expert in Java and another to be an expert in *your team's Java standards*.  Custom instructions bridge that gap.

#### Step 1: Review Current Standards

1. Open `.github/copilot-instructions.md`
2. See existing standards for the project.  Note you can reference other files, links, etc.
   - Formatting is just markdown.  Be concise as this takes up context space.  
   - You can reference other files or links for more detail.  
   - For your projects, the more documentation you have in repo the better, as Copilot agent mode can reference it directly.
3. Note instructions can be path-specific to minimize context usage.  Look in `.github/instructions` for examples of path-specific instructions.

**Important:** Don't have a `copilot-instructions.md` file yet?  Click the gear icon at the top of the Copilot Chat panel, then **"Generate Chat Instructions"** to generate a starter file from your workspace.  Alternatively, check out [awesome-copilot instructions](https://github.com/github/awesome-copilot/tree/main/instructions) for inspiration. 

#### Step 2: Add Custom Instructions

Add this section to `.github/copilot-instructions.md` before the bottom `---` line:

```markdown
## REST API Guidelines

For all REST API endpoints:

* Use descriptive naming following RESTful conventions
* Add Swagger/OpenAPI documentation
* Implement TAO observability (logging, metrics, tracing)
  - Assume TAO package is already installed
  - Follow patterns in existing routes
```

TAO is a fictitious observability framework for this workshop.  You can read about it in `docs/tao.md`.  It is used to show that you can encode your own internal standards that Copilot can reference.

#### Step 3: Test the Instructions

1. Clear chat history, switch to `Agent` mode.  Choose any model (Claude Sonnet 4.5 recommended)
2. Prompt:
   ```text
   Add observability to the Supplier route using our internal standards
   ```
3. Notice Copilot:
   - Adds TAO logging to `supplier.ts`
   - Includes metrics
   - Adds tracing
   - **Doesn't try to install TAO** (respects your instruction)

4. Click 'Undo' to revert all changes.  We don't want to keep these changes as TAO is fictitious and it will break our app! 

5. Update `.github/copilot-instructions.md` to remove the TAO content you added so it doesn't impact other usage.

#### Step 4: Create a Handoff

Sometimes you need to pass context to a teammate, a new chat session, or an agent.  Custom prompts can help with this.  Lets create a plan and then use a **handoff** to generate a summary document.

1. Clear chat, switch to `Plan` mode.  Consider switching to the latest  model for planning use cases.
2. Run the handoff command with the below prompt:
   ```text
   /handoff Create a plan for a user profile page with edit capability and picture upload
   ```
31. Review generated `handoff.md` - contains:
   - Requirements summary
   - Implementation plan
   - Key decisions/assumptions
   - Next steps

The steps are just defined in `.github/prompts/handoff.prompt.md`.  You can of course customize this.  For example, you might want it to automatically create a file in your workspace.  You could always ask a follow up question to do that too. 

### What You Learned

✅ **Custom Instructions** - Team standards encoded once, applied everywhere  
✅ **Path-Specific Instructions** - Different rules for different file types  
✅ **Handoff Files** - Transfer context between sessions, developers, or agents

----
### **Scenario 2:** Delegate tasks to custom agent
**Your Challenge:**  Delegate work to a custom agent while you focus on other high-value tasks.

#### Step 1: Use Custom Agents for Specialized Work

**Scenario:** You need BDD tests for the cart feature.

1. Open a new chat session
2. Choose the **BDD Specialist** agent
3. Run with the following prompt:
   ```text
   Add comprehensive BDD tests for the Cart page feature
   ```

4. Agent starts working.

> If interested, you can look at `.github/agents/bdd-specialist.agent.md` to see how this custom agent is defined.  You can create your own custom agents for your team as well!

#### Step 3: Monitor from Mission Control

1. Navigate to https://github.com/copilot/agents
2. See all your active agent sessions 
3. Click on the BDD session that should be in progress:
   - Note you can view real-time progress and see commands executed
     - Each `>` can be expanded to see more detail
   - Also see the pull request details on the right
4. **Steer mid-session by prompting Copilot:**
   ```text
   While you're at it, add error handling for network failures
   ```

   > Copilot will incorporate your feedback as it works.

### What You Learned

✅ **Custom Agents** - Specialized tools for specific domains  
✅ **Mission Control** - Manage multiple agents like a project manager  
✅ **Async Workflows** - Delegate and move on, check back later  
✅ **Mid-Session Steering** - Guide agents as they work

---

## Week 2: Use Copilot to build a new feature and improve test coverage
### **Scenario:** *"We need a shopping cart. Users should be able to add products, see a count in the nav bar, and view their cart on a dedicated page."*

**Your Challenge:** Build this feature end-to-end, matching a provided design.
#### Step 1: Understand Requirements with Planning Mode

A new **Planning mode** was shipped to VS Code in version 1.106 and helps build a plan and clarify requirements without implementing code.  

1. Open Copilot Chat in VS Code, switch to `Plan` mode
3. Drag `docs/design/cart.png` into chat (feel free to open it to review first)
4. Prompt:
   ```text
   I need to implement a shopping cart feature in this application matching this image including routing, navbar badge with item count, state management, and add/remove interactions.
   ```
5. Copilot will analyze, research, think, and can ask clarifying questions like:
   - Should the cart persist across sessions?
   - What data should be stored?
   - Any constraints on UI/UX?
6. Answer the questions or say "Use standard e-commerce patterns"
7. Review the generated plan - iterate if needed

#### Step 2: Implement with Agent Mode

1. Switch to `Agent` mode. You can select `Claude Sonnet 4.5` or any other model of your choice.
2. Click the `Start Implementation` button or prompt:
   ```text
   Implement the plan you just produced.
   ```
3. **Agent will:**
   - Create Cart component and page
   - Add routing
   - Implement state management (Context/Provider)
   - Add NavBar badge
   - Wire up add/remove functionality

You can follow along as files are created/modified.  If it doesn't run the application to verify it, you should ask the agent to 'start the application and verify the cart works as expected'. 

#### Step 3: Test and Iterate
1. Run the application:
   ```bash
   npm run dev
   ```
2. Test in browser - 
3. - If accessing through Codespace, click on 'Ports' tab to open port 5137:
      - Click `Continue` if you get a warning about accessing a Codespace
   - You should see a cart icon in the nav bar at upper right
   - Go to the 'Products' page or click 'Explore Products'
   - Increment a quantity of a product and add to cart
   - Verify badge updates (shows a count next to the cart icon)
   - Click the cart icon to view cart page
4. If issues arise, have Copilot help troubleshoot.  Example prompt:
   ```text
   The badge doesn't update when I add items. Fix this.
   ```
5. When you are all done, got back to the Copilot Chat window and click 'Keep' to save the changes.  
#### What You Learned

✅ **Planning Mode** - Build a plan and clarify ambiguous requirements  
✅ **Vision** - Copilot understands UI designs  
✅ **Agent Mode** - Multi-file implementation with iteration  
✅ **Self-correction** - Agent can fix its own mistakes

---
### **Scenario:** Your tech lead says: *"Our API test coverage is at 45%. We need to get it above 80% before the release."*

**Your Challenge:** Systematically improve test coverage across all API routes.
### Step 1: Use a Reusable Prompt File

Manually prompting for test coverage improvements can work.  However, it also means that the process many be inconsistent between developers and it is difficult to immplement improvements. Instead, (have Copilot) create a documented prompt file checked into your repository.  Utilize this and enhance it over time based on responses where Copilot struggled.  Here we have provided a starting point (well, Copilot has)!

1. If you haven't already, click the `+` button in the Copilot Chat panel to clear your history.  This is a best practice when switching between use cases or activities to avoid sending unnecessary context.
2. Review `.github/prompts/demo-unit-test-coverage.prompt.md`
3. Notice it defines:
   - Objective and routes to focus on
   - Testing patterns to follow (examples)
   - Success Criteria
   - Links to relevant documentation
4. Notice the prompt does not say the percentage desired is greater than 80%.  If that was important it could be added here.

### Step 2: Execute the Prompt

1. Switch to `Agent` mode, select the `Claude Sonnet 4.5` or `Claude Sonnet 4` models.  Newer is typically better...
2. Run the prompt:
   - **Option A:** Click the play button when the prompt file is open
   - **Option B:** Type `/demo-unit-test-coverage` in chat.  The prompt name automatically becomes a slash command.

### Step 3: Agent Self-Heals Failures

Note that any terminal command requires you to click `Allow` to let Copilot execute it.  This is a security feature to prevent unauthorized code execution.  However, you can also allow list certain commands that you know are not destructive.  

Agent will:
- Analyze current coverage
- Generate new test cases for product and supplier routes
- **Run tests automatically**
- Fix any failures
- Re-run until tests pass

**Important:** Press `q` when coverage report shows to let agent continue.  Otherwise it will wait indefinitely.

### Step 4: Verify Results Yourself

This specific prompt focuses on `product` and `supplier` routes.  However, Copilot could also be prompted to cover all routes if desired.  You can verify coverage as follows:

```bash
npm run test:coverage --workspace=api
```

Review the coverage report - it should be significantly improved. 

Click `Keep` to save these new tests to your codebase.

### What You Learned

✅ **Prompt Files** - Reusable, documented workflows that can be improved over time
✅ **Iteration** - Agent iterates to fix failing tests automatically  

**Value:** Comprehensive test suite that would take days to write manually

---

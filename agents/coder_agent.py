import os
from crewai import Agent, Task, Crew
from crewai_tools import DirectoryReadTool, FileReadTool, FileWriterTool

# Define project directory relative to this script
PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Initialize tools
dir_tool = DirectoryReadTool(directory=PROJECT_DIR)
file_read_tool = FileReadTool()
# Pinning the write tool to the project directory ensures it stays within bounds
file_write_tool = FileWriterTool(directory=PROJECT_DIR)

# 1. Define the Agent with explicit technical expectations
coder_agent = Agent(
    role='Senior Next.js & Prisma Developer',
    goal='Debug, write endpoints, update database schemas, and optimize the Latimore Hub codebase.',
    backstory=(
        "You are an expert full-stack developer specializing in React, Next.js App Router, TypeScript, "
        "Prisma, and PostgreSQL. You possess deep knowledge of secure API endpoint design, "
        "cryptographic verification (crypto module), and webhook signature validation."
    ),
    tools=[dir_tool, file_read_tool, file_write_tool],
    verbose=True
)

# 2. Refine the Task with explicit security criteria
debug_task = Task(
    description=(
        f"1. Use the `DirectoryReadTool` or `FileReadTool` to locate and read the webhook implementation, "
        f"starting at `app/api/webhooks/fillout/route.ts` or `app/api/fillout/route.ts` within {PROJECT_DIR}.\n"
        f"2. Inspect how the Fillout webhook signature is being validated. Verify that it uses standard "
        f"HMAC-SHA256 verification via Node's `crypto` module, comparing the computed hash against "
        f"the header signature using `crypto.timingSafeEqual` to prevent timing attacks.\n"
        f"3. If the validation is missing, insecure, or broken, rewrite the file using `FileWriterTool` "
        f"to implement robust HMAC validation.\n"
        f"4. Provide a clear summary of your findings and any changes made."
    ),
    expected_output=(
        "A detailed code review summary. If vulnerabilities were found, include the modified "
        "TypeScript code showing the secure HMAC validation implementation."
    ),
    agent=coder_agent
)

# 3. Assemble the Crew
crew = Crew(
    agents=[coder_agent],
    tasks=[debug_task],
    verbose=True
)

if __name__ == "__main__":
    # Kick off the execution loop
    result = crew.kickoff()
    print("\n--- Execution Result ---")
    print(result)

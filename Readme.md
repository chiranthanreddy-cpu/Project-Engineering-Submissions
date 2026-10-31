# Project Engineering Track Repository

## Overview

This repository contains a curated set of **engineering challenges** designed as part of the **Project Engineering Track**. Each challenge is structured as a **broken, incomplete, or poorly designed codebase** that students must analyze, debug, refactor, and extend.

Unlike traditional project-based learning, this repository focuses on **working with existing systems**, simulating real-world engineering environments where developers inherit imperfect codebases and are expected to improve them.

---

## Purpose

The repository is built to address key gaps in conventional learning:

- Students often know how to **build features**, but not how to **engineer systems**
- Traditional capstone evaluation does not reflect **true engineering capability**
- Increasing reliance on AI tools reduces **depth of understanding**

This track ensures students:

- Develop **engineering thinking**
- Build and ship **production-ready systems**
- Learn to use AI as a **co-pilot, not a replacement**
- Gain experience in **debugging, refactoring, and system design**

---

## Core Philosophy

> Engineering is not about writing code from scratch.  
> It is about understanding, fixing, and evolving systems.

This repository enforces:

- Practice-first learning
- Deployment-focused development
- Structured debugging
- Real-world engineering constraints
- Explainability of every line of code

---

## Repository Structure

The repository is divided into **9 milestones**, each representing a stage in engineering maturity:

```bash
Milestone-01/
Milestone-02/
Milestone-03/
...
Milestone-09/
```

Each milestone contains one or more **challenge repositories** with intentional issues.

---

## Nature of Challenges

Each challenge is designed to simulate real engineering scenarios and may include:

- Incomplete implementations
- Logical and architectural flaws
- Poor code structure
- Missing validations or constraints
- Security vulnerabilities
- Performance bottlenecks
- Deployment misconfigurations

Students are expected to:

1. Understand the existing system  
2. Identify issues (functional and non-functional)  
3. Fix and refactor the codebase  
4. Implement missing features  
5. Deploy a working solution  
6. Justify all engineering decisions  

---

## Technology Stack

### Primary Stack (PERN)

- **PostgreSQL** – Relational database  
- **Express.js** – Backend framework  
- **React.js** – Frontend library  
- **Node.js** – Runtime environment  
- **Prisma ORM** – Database ORM layer  

### Supporting Tools & Technologies

- API Testing: Postman / Bruno  
- Load Testing: Apache JMeter  
- Database Design: DrawSQL  
- System Design: Excalidraw / Figma  
- AI Integration: Google AI Studio, Gemini / OpenRouter APIs  
- Deployment Platforms:
  - Netlify (Frontend)
  - Render (Backend)
  - Optional: AWS / GCP  

---

## Milestone Breakdown

### Milestone 1 – Engineering Mindset & Workflow
- Understanding modern engineering practices  
- AI-assisted development (vibe coding vs engineering)  
- First deployed mini project  
- Introduction to structured workflows  

---

### Milestone 2 – Requirement Engineering & HLD
- Converting vague inputs into structured requirements  
- Writing user stories and acceptance criteria  
- Defining MVP scope  
- Creating High-Level Design (HLD)  

---

### Milestone 3 – Data Modeling & Schema Design
- Entity identification and relationships  
- ERD creation  
- PostgreSQL schema design  
- Constraints, validation, indexing  
- Refactoring flawed schemas  

---

### Milestone 4 – Backend Architecture & API Design
- REST API design  
- Layered architecture (controller/service)  
- Prisma integration  
- Logging and debugging  
- Fixing real-world backend issues  
- API testing and documentation  

---

### Milestone 5 – Frontend Architecture & State Management
- Component structuring  
- API integration  
- State management  
- UX-driven design decisions  
- Fixing real-world frontend bugs  

---

### Milestone 6 – Authentication & Authorization
- JWT-based authentication  
- Role-based access control  
- Secure backend enforcement  
- Vulnerability identification and fixes  

---

### Milestone 7 – Performance & Scalability
- Query optimization  
- Pagination  
- Load testing  
- Frontend performance improvements  
- Measuring and improving system performance  

---

### Milestone 8 – Deployment Engineering
- Environment configuration  
- CI/CD basics  
- Docker containerization  
- Debugging deployment failures  
- Production readiness checklist  

---

### Milestone 9 – AI Integration
- Backend wrapper for LLM APIs  
- Prompt engineering  
- Token usage optimization  
- Rate limiting and guardrails  
- Secure AI feature deployment  

---

## Expected Workflow

For each challenge:

1. Clone the repository  
2. Set up the environment and dependencies  
3. Run the application  
4. Identify issues and gaps  
5. Debug and refactor the system  
6. Implement missing features  
7. Test thoroughly (API + UI)  
8. Deploy the application  
9. Document decisions and fixes  

---

## Learning Outcomes

By completing this repository, students will be able to:

- Work effectively with **existing codebases**  
- Debug and fix **real-world engineering issues**  
- Design and justify **system architecture**  
- Build and deploy **full-stack applications**  
- Apply **performance and security best practices**  
- Use AI tools **responsibly and effectively**  

---

## AI Usage Policy

AI is treated as an **engineering accelerator**, not a substitute for understanding.

### Allowed Usage

- Understanding concepts  
- Debugging errors  
- Generating starter code  
- Refactoring and improving code  
- Exploring architectural approaches  

### Not Allowed

- Submitting fully AI-generated solutions without understanding  
- Copy-pasting code without validation  
- Inability to explain implemented logic  

Students must be able to:

- Explain every line of code  
- Justify design decisions  
- Debug independently  
- Modify generated solutions  

---

## Deployment Requirement

All submissions must be:

- Fully functional  
- Deployed (no local-only submissions)  
- Configured using environment variables  
- Tested in production-like environments  

---

## Contribution Guidelines

When adding or modifying challenges:

- Maintain intentional imperfections in codebases  
- Avoid providing fully solved implementations  
- Inject realistic engineering issues  
- Ensure consistency across milestones  
- Align challenges with learning objectives  

---

## Summary

This repository is a **structured engineering training system**, not just a collection of projects. It is designed to transform students from:

> Feature implementers → System engineers

Each milestone builds progressively toward real-world engineering capability, ensuring students can design, build, debug, and deploy scalable applications with confidence.

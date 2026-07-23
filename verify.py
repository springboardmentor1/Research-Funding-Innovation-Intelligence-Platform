#!/usr/bin/env python3
"""
Verification script to test the integrated application.
Runs all checks and provides a summary.
"""

import subprocess
import sys
import os
from pathlib import Path


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'


def run_command(cmd, cwd=None):
    """Run a shell command and return success status."""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)


def check_file_exists(filepath):
    """Check if a file exists."""
    return Path(filepath).exists()


def print_header(text):
    """Print a colored header."""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{text.center(60)}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")


def print_success(text):
    """Print success message."""
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")


def print_error(text):
    """Print error message."""
    print(f"{Colors.RED}✗ {text}{Colors.END}")


def print_info(text):
    """Print info message."""
    print(f"{Colors.YELLOW}ℹ {text}{Colors.END}")


def verify_structure():
    """Verify project structure."""
    print_header("Verifying Project Structure")
    
    required_files = [
        "backend/main.py",
        "backend/requirements.txt",
        "frontend/package.json",
        "frontend/src/App.jsx",
        ".env.example",
        "docker-compose.yml",
        ".github/workflows/ci-cd.yml"
    ]
    
    all_exist = True
    for file in required_files:
        if check_file_exists(file):
            print_success(f"Found: {file}")
        else:
            print_error(f"Missing: {file}")
            all_exist = False
    
    return all_exist


def verify_backend():
    """Verify backend setup."""
    print_header("Verifying Backend Setup")
    
    # Check Python version
    success, stdout, _ = run_command("python --version")
    if success:
        print_success(f"Python installed: {stdout.strip()}")
    else:
        print_error("Python not found")
        return False
    
    # Check if pytest is available
    success, _, _ = run_command("pip list | findstr pytest", cwd="backend")
    if success or run_command("pip show pytest")[0]:
        print_success("Pytest is available")
    else:
        print_info("Pytest not installed - run: pip install -r backend/requirements-test.txt")
    
    # Check main.py syntax
    success, _, error = run_command("python -m py_compile backend/main.py")
    if success:
        print_success("Backend main.py syntax is valid")
    else:
        print_error(f"Backend main.py has syntax errors: {error}")
        return False
    
    return True


def verify_frontend():
    """Verify frontend setup."""
    print_header("Verifying Frontend Setup")
    
    # Check Node.js version
    success, stdout, _ = run_command("node --version")
    if success:
        print_success(f"Node.js installed: {stdout.strip()}")
    else:
        print_error("Node.js not found")
        return False
    
    # Check if node_modules exists
    if Path("frontend/node_modules").exists():
        print_success("Frontend dependencies installed")
    else:
        print_info("Frontend dependencies not installed - run: cd frontend && npm install")
    
    # Check package.json syntax
    success, _, _ = run_command("node -e \"require('./frontend/package.json')\"")
    if success:
        print_success("Frontend package.json is valid")
    else:
        print_error("Frontend package.json has issues")
        return False
    
    return True


def verify_docker():
    """Verify Docker setup."""
    print_header("Verifying Docker Setup")
    
    # Check if docker is installed
    success, stdout, _ = run_command("docker --version")
    if success:
        print_success(f"Docker installed: {stdout.strip()}")
    else:
        print_info("Docker not installed - install from https://www.docker.com/products/docker-desktop")
        return False
    
    # Check Dockerfile
    if check_file_exists("Dockerfile"):
        print_success("Dockerfile found")
    else:
        print_error("Dockerfile not found")
        return False
    
    if check_file_exists("docker-compose.yml"):
        print_success("docker-compose.yml found")
    else:
        print_error("docker-compose.yml not found")
        return False
    
    return True


def verify_integration():
    """Verify backend-frontend integration."""
    print_header("Verifying Backend-Frontend Integration")
    
    # Check API client configuration
    if check_file_exists("frontend/src/api/client.js"):
        with open("frontend/src/api/client.js", "r") as f:
            content = f.read()
            if "axios" in content and "Bearer" in content:
                print_success("API client properly configured with auth")
            else:
                print_error("API client missing auth configuration")
                return False
    else:
        print_error("API client not found")
        return False
    
    # Check if backend has CORS enabled
    if check_file_exists("backend/main.py"):
        with open("backend/main.py", "r") as f:
            content = f.read()
            if "CORSMiddleware" in content:
                print_success("Backend has CORS middleware configured")
            else:
                print_error("Backend missing CORS configuration")
                return False
    
    return True


def generate_summary(results):
    """Generate and print verification summary."""
    print_header("Verification Summary")
    
    checks = [
        ("Project Structure", results["structure"]),
        ("Backend Setup", results["backend"]),
        ("Frontend Setup", results["frontend"]),
        ("Docker Setup", results["docker"]),
        ("Integration", results["integration"])
    ]
    
    passed = sum(1 for _, result in checks if result)
    total = len(checks)
    
    for name, result in checks:
        if result:
            print_success(name)
        else:
            print_error(name)
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"Results: {Colors.GREEN}{passed}/{total}{Colors.END} checks passed")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    if passed == total:
        print_success("All verification checks passed! Ready to run the application.")
        return True
    else:
        print_error("Some checks failed. Please review the issues above.")
        return False


def main():
    """Run all verifications."""
    print(f"\n{Colors.BLUE}AI Research Funding Platform - Verification Script{Colors.END}\n")
    
    results = {
        "structure": verify_structure(),
        "backend": verify_backend(),
        "frontend": verify_frontend(),
        "docker": verify_docker(),
        "integration": verify_integration()
    }
    
    success = generate_summary(results)
    
    print_info("Next Steps:")
    print("  1. Backend setup:   cd backend && pip install -r requirements-test.txt")
    print("  2. Frontend setup:  cd frontend && npm install")
    print("  3. Run tests:       pytest backend/tests/ (requires test dependencies)")
    print("  4. Start dev:       docker-compose up (requires Docker)")
    print("  5. Or run locally:  Backend: uvicorn backend.main:app --reload")
    print("                      Frontend: npm run dev (from frontend/)")
    print()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())

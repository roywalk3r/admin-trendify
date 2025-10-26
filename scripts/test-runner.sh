#!/bin/bash

# Trendify Test Runner Script
# Usage: ./scripts/test-runner.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║     Trendify Test Suite Runner        ║"
echo "╔════════════════════════════════════════╗"
echo -e "${NC}"

# Parse arguments
TEST_TYPE="${1:-all}"
COVERAGE="${2:-false}"

run_tests() {
    local test_path=$1
    local test_name=$2
    
    echo -e "${YELLOW}Running ${test_name}...${NC}"
    
    if [ "$COVERAGE" = "coverage" ]; then
        pnpm vitest run "$test_path" --coverage
    else
        pnpm vitest run "$test_path"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${test_name} passed${NC}"
        return 0
    else
        echo -e "${RED}✗ ${test_name} failed${NC}"
        return 1
    fi
}

# Main test execution
case $TEST_TYPE in
    all)
        echo -e "${BLUE}Running all tests...${NC}"
        if [ "$COVERAGE" = "coverage" ]; then
            pnpm vitest run --coverage
        else
            pnpm vitest run
        fi
        ;;
    
    api)
        run_tests "tests/api" "API Tests"
        ;;
    
    components)
        run_tests "tests/components" "Component Tests"
        ;;
    
    integration)
        run_tests "tests/integration" "Integration Tests"
        ;;
    
    unit)
        run_tests "tests/lib" "Unit Tests"
        run_tests "tests/hooks" "Hook Tests"
        ;;
    
    security)
        run_tests "tests/security" "Security Tests"
        ;;
    
    performance)
        run_tests "tests/performance" "Performance Tests"
        ;;
    
    watch)
        echo -e "${BLUE}Starting watch mode...${NC}"
        pnpm vitest watch
        ;;
    
    coverage)
        echo -e "${BLUE}Generating coverage report...${NC}"
        pnpm vitest run --coverage
        echo -e "${GREEN}Coverage report generated in ./coverage/${NC}"
        ;;
    
    help|--help|-h)
        echo "Trendify Test Runner"
        echo ""
        echo "Usage: ./scripts/test-runner.sh [type] [coverage]"
        echo ""
        echo "Test Types:"
        echo "  all           - Run all tests (default)"
        echo "  api           - Run API tests only"
        echo "  components    - Run component tests only"
        echo "  integration   - Run integration tests only"
        echo "  unit          - Run unit tests (lib + hooks)"
        echo "  security      - Run security tests only"
        echo "  performance   - Run performance tests only"
        echo "  watch         - Run tests in watch mode"
        echo "  coverage      - Generate coverage report"
        echo ""
        echo "Examples:"
        echo "  ./scripts/test-runner.sh all"
        echo "  ./scripts/test-runner.sh api coverage"
        echo "  ./scripts/test-runner.sh watch"
        ;;
    
    *)
        echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
        echo "Run './scripts/test-runner.sh help' for usage information"
        exit 1
        ;;
esac

# Summary
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║    All tests completed successfully!  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║         Some tests failed             ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    exit 1
fi

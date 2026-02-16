#!/bin/bash

# ========================================
# 推特大佬电子阅览室 - 功能测试脚本
# ========================================

BASE_URL="http://localhost:3002"
TEST_RESULTS=()
PASS_COUNT=0
FAIL_COUNT=0

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local name="$1"
    local url="$2"
    local expected_key="$3"

    echo -e "${YELLOW}Testing: ${name}${NC}"

    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${url}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ]; then
        if echo "$body" | jq -e ".${expected_key}" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PASS${NC}: $name (HTTP $http_code)"
            TEST_RESULTS+=("✅ $name")
            ((PASS_COUNT++))
            return 0
        else
            echo -e "${RED}❌ FAIL${NC}: $name - Missing key: $expected_key"
            TEST_RESULTS+=("❌ $name - Missing key: $expected_key")
            ((FAIL_COUNT++))
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC}: $name (HTTP $http_code)"
        TEST_RESULTS+=("❌ $name (HTTP $http_code)")
        ((FAIL_COUNT++))
        return 1
    fi
}

# 测试性能
test_performance() {
    local name="$1"
    local url="$2"
    local threshold="$3"

    echo -e "${YELLOW}Testing Performance: ${name}${NC}"

    start_time=$(date +%s%N)
    response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${url}")
    end_time=$(date +%s%N)

    duration=$(( (end_time - start_time) / 1000000 ))
    duration_sec=$(echo "scale=3; $duration / 1000" | bc)

    if [ "$response" -eq 200 ]; then
        if [ "$duration" -lt "$threshold" ]; then
            echo -e "${GREEN}✅ PASS${NC}: $name (${duration_sec}s < ${threshold}ms)"
            TEST_RESULTS+=("✅ Performance: $name (${duration_sec}s)")
            ((PASS_COUNT++))
            return 0
        else
            echo -e "${YELLOW}⚠️  WARN${NC}: $name (${duration_sec}s >= ${threshold}ms)"
            TEST_RESULTS+=("⚠️  Performance: $name (${duration_sec}s)")
            ((PASS_COUNT++))
            return 0
        fi
    else
        echo -e "${RED}❌ FAIL${NC}: $name (HTTP $response)"
        TEST_RESULTS+=("❌ Performance: $name (HTTP $response)")
        ((FAIL_COUNT++))
        return 1
    fi
}

echo "=========================================="
echo "推特大佬电子阅览室 - 功能测试"
echo "=========================================="
echo ""

# ========================================
# 1. 首页 API 测试
# ========================================
echo "【1. 首页测试】"
test_api "获取所有类目" "/api/categories" "data"
echo ""

# ========================================
# 2. 类目详情页测试
# ========================================
echo "【2. 类目详情页测试】"
test_api "类目: ai-tech" "/api/categories/ai-tech" "data.category"
test_api "类目: startup-global" "/api/categories/startup-global" "data.category"
test_api "类目: investment-finance" "/api/categories/investment-finance" "data.category"
test_api "类目分页" "/api/categories/ai-tech?limit=5&offset=0" "pagination"
echo ""

# ========================================
# 3. KOL 详情页测试
# ========================================
echo "【3. KOL 详情页测试】"

# 从数据库获取 5 个 KOL username
KOLS=$(psql -h localhost -U xkol -d xkol_db -t -c "SELECT username FROM kols LIMIT 5;" 2>/dev/null | tr -d ' ')

if [ -z "$KOLS" ]; then
    echo "无法从数据库获取 KOL 列表，使用默认列表"
    KOLS=("dotey" "levelsio" "sama" "karpathy" "hwchase17")
else
    KOLS=($KOLS)
fi

for kol in "${KOLS[@]}"; do
    test_api "KOL: $kol" "/api/kols/$kol" "data.username"
    test_api "KOL 推文: $kol" "/api/kols/$kol/tweets" "data.tweets"
done
echo ""

# ========================================
# 4. 搜索功能测试
# ========================================
echo "【4. 搜索功能测试】"
test_api "搜索: AI" "/api/search?q=AI" "data"
test_api "搜索: AI (仅 KOL)" "/api/search?q=AI&type=kols" "data.kols"
test_api "搜索: AI (仅推文)" "/api/search?q=AI&type=tweets" "data.tweets"
test_api "搜索: ChatGPT" "/api/search?q=ChatGPT" "data"
echo ""

# ========================================
# 5. 性能测试
# ========================================
echo "【5. 性能测试】"
test_performance "首页加载速度" "/api/categories" 2000
test_performance "类目页加载速度" "/api/categories/ai-tech" 2000
test_performance "KOL 详情页加载速度" "/api/kols/dotey" 2000
test_performance "搜索响应速度" "/api/search?q=AI" 2000
echo ""

# ========================================
# 6. 错误处理测试
# ========================================
echo "【6. 错误处理测试】"

# 测试 404
response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/categories/nonexistent")
if [ "$response" -eq 404 ]; then
    echo -e "${GREEN}✅ PASS${NC}: 404 错误处理"
    TEST_RESULTS+=("✅ 404 错误处理")
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ FAIL${NC}: 404 错误处理 (HTTP $response)"
    TEST_RESULTS+=("❌ 404 错误处理")
    ((FAIL_COUNT++))
fi

# 测试搜索缺少参数
response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/search")
if [ "$response" -eq 400 ]; then
    echo -e "${GREEN}✅ PASS${NC}: 400 错误处理（缺少参数）"
    TEST_RESULTS+=("✅ 400 错误处理")
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ FAIL${NC}: 400 错误处理 (HTTP $response)"
    TEST_RESULTS+=("❌ 400 错误处理")
    ((FAIL_COUNT++))
fi
echo ""

# ========================================
# 测试总结
# ========================================
echo "=========================================="
echo "测试总结"
echo "=========================================="
echo "总测试数: $((PASS_COUNT + FAIL_COUNT))"
echo -e "${GREEN}通过: ${PASS_COUNT}${NC}"
echo -e "${RED}失败: ${FAIL_COUNT}${NC}"
echo -e "通过率: $(echo "scale=2; $PASS_COUNT * 100 / ($PASS_COUNT + $FAIL_COUNT)" | bc)%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}❌ 有 ${FAIL_COUNT} 个测试失败${NC}"
    exit 1
fi

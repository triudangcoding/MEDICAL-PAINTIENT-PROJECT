#!/bin/bash

echo "=========================================="
echo "TEST UPDATE FIELDS API"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:9933/api"

# Login với DOCTOR
echo -e "${BLUE}1. Đăng nhập với tài khoản DOCTOR...${NC}"
DOCTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0396157476",
    "password": "123123"
  }')

DOCTOR_TOKEN=$(echo $DOCTOR_LOGIN | jq -r '.data.accessToken')
echo -e "${GREEN}✅ Doctor logged in${NC}"
echo ""

# Test UPDATE Doctor Fields
echo -e "${BLUE}2. Test PUT /api/doctor/fields - Update fullName${NC}"
UPDATE_DOCTOR=$(curl -s -X PUT "$BASE_URL/doctor/fields" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Võ Quốc Triẹu - Updated"
  }')

echo "$UPDATE_DOCTOR" | jq '.fullName, .majorDoctor.name' 2>/dev/null
echo ""

# Login với PATIENT
echo -e "${BLUE}3. Đăng nhập với tài khoản PATIENT...${NC}"
PATIENT_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0988009115",
    "password": "123123"
  }')

PATIENT_TOKEN=$(echo $PATIENT_LOGIN | jq -r '.data.accessToken')
echo -e "${GREEN}✅ Patient logged in${NC}"
echo ""

# Test UPDATE Patient Fields
echo -e "${BLUE}4. Test PUT /api/patient/fields - Update fullName${NC}"
UPDATE_PATIENT=$(curl -s -X PUT "$BASE_URL/patient/fields" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Bệnh Nhân Test - Updated"
  }')

echo "$UPDATE_PATIENT" | jq '.fullName, .stats.adherenceRate' 2>/dev/null
echo ""

echo -e "${GREEN}=========================================="
echo "✅ HOÀN THÀNH TEST UPDATE!"
echo "==========================================${NC}"

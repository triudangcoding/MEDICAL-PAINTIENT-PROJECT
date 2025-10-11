#!/bin/bash

echo "=========================================="
echo "TEST API GET ALL FIELDS"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:9933/api"

# Login với DOCTOR
echo -e "${BLUE}1. Đăng nhập với tài khoản DOCTOR (0396157476)...${NC}"
DOCTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0396157476",
    "password": "123123"
  }')

DOCTOR_TOKEN=$(echo $DOCTOR_LOGIN | jq -r '.data.accessToken' 2>/dev/null)

if [ -z "$DOCTOR_TOKEN" ] || [ "$DOCTOR_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Không thể đăng nhập với tài khoản Doctor${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Đăng nhập thành công!${NC}"
echo "Doctor ID: $(echo $DOCTOR_LOGIN | jq -r '.data.user.id')"
echo "Doctor Name: $(echo $DOCTOR_LOGIN | jq -r '.data.user.fullName')"
echo "Doctor Token: ${DOCTOR_TOKEN:0:50}..."
echo ""

# Test API Doctor Fields
echo -e "${BLUE}2. Test API GET /api/doctor/fields${NC}"
echo "Request: GET $BASE_URL/doctor/fields"
echo ""
DOCTOR_FIELDS=$(curl -s -X GET "$BASE_URL/doctor/fields" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json")

echo -e "${GREEN}=== ✅ DOCTOR ALL FIELDS RESPONSE ===${NC}"
echo "$DOCTOR_FIELDS" | jq '.' 2>/dev/null || echo "$DOCTOR_FIELDS"
echo ""
echo "Lưu vào file: doctor_fields.json"
echo "$DOCTOR_FIELDS" | jq '.' > doctor_fields.json 2>/dev/null || echo "$DOCTOR_FIELDS" > doctor_fields.json
echo ""
echo "-------------------------------------------"
echo ""

# Login với PATIENT
echo -e "${BLUE}3. Đăng nhập với tài khoản PATIENT (0988009115)...${NC}"
PATIENT_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0988009115",
    "password": "123123"
  }')

PATIENT_TOKEN=$(echo $PATIENT_LOGIN | jq -r '.data.accessToken' 2>/dev/null)

if [ -z "$PATIENT_TOKEN" ] || [ "$PATIENT_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Không thể đăng nhập với tài khoản Patient${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Đăng nhập thành công!${NC}"
echo "Patient ID: $(echo $PATIENT_LOGIN | jq -r '.data.user.id')"
echo "Patient Name: $(echo $PATIENT_LOGIN | jq -r '.data.user.fullName')"
echo "Patient Token: ${PATIENT_TOKEN:0:50}..."
echo ""

# Test API Patient Fields
echo -e "${BLUE}4. Test API GET /api/patient/fields${NC}"
echo "Request: GET $BASE_URL/patient/fields"
echo ""
PATIENT_FIELDS=$(curl -s -X GET "$BASE_URL/patient/fields" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json")

echo -e "${GREEN}=== ✅ PATIENT ALL FIELDS RESPONSE ===${NC}"
echo "$PATIENT_FIELDS" | jq '.' 2>/dev/null || echo "$PATIENT_FIELDS"
echo ""
echo "Lưu vào file: patient_fields.json"
echo "$PATIENT_FIELDS" | jq '.' > patient_fields.json 2>/dev/null || echo "$PATIENT_FIELDS" > patient_fields.json
echo ""

echo -e "${GREEN}=========================================="
echo "✅ HOÀN THÀNH! Kiểm tra 2 file JSON:"
echo "  📄 doctor_fields.json"
echo "  📄 patient_fields.json"
echo "==========================================${NC}"

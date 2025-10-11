#!/bin/bash

echo "=========================================="
echo "TEST API GET ALL FIELDS"
echo "=========================================="
echo ""

# Màu sắc cho output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:9933/api"

# Login với DOCTOR
echo -e "${BLUE}1. Đăng nhập với tài khoản DOCTOR...${NC}"
DOCTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0123456789",
    "password": "123456"
  }')

DOCTOR_TOKEN=$(echo $DOCTOR_LOGIN | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$DOCTOR_TOKEN" ]; then
  echo -e "${YELLOW}Không lấy được token doctor. Thử với SĐT khác...${NC}"
  DOCTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "phoneNumber": "0987654321",
      "password": "doctor123"
    }')
  DOCTOR_TOKEN=$(echo $DOCTOR_LOGIN | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
fi

echo "Doctor Token: ${DOCTOR_TOKEN:0:50}..."
echo ""

# Test API Doctor Fields
echo -e "${BLUE}2. Test API GET /api/doctor/fields${NC}"
echo "Request: GET $BASE_URL/doctor/fields"
echo ""
DOCTOR_FIELDS=$(curl -s -X GET "$BASE_URL/doctor/fields" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json")

echo -e "${GREEN}=== DOCTOR ALL FIELDS RESPONSE ===${NC}"
echo "$DOCTOR_FIELDS" | jq '.' 2>/dev/null || echo "$DOCTOR_FIELDS"
echo ""
echo "Lưu vào file: doctor_fields.json"
echo "$DOCTOR_FIELDS" | jq '.' > doctor_fields.json 2>/dev/null || echo "$DOCTOR_FIELDS" > doctor_fields.json
echo ""

# Login với PATIENT
echo -e "${BLUE}3. Đăng nhập với tài khoản PATIENT...${NC}"
PATIENT_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0111111111",
    "password": "123456"
  }')

PATIENT_TOKEN=$(echo $PATIENT_LOGIN | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$PATIENT_TOKEN" ]; then
  echo -e "${YELLOW}Không lấy được token patient. Thử với SĐT khác...${NC}"
  PATIENT_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "phoneNumber": "0999999999",
      "password": "patient123"
    }')
  PATIENT_TOKEN=$(echo $PATIENT_LOGIN | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
fi

echo "Patient Token: ${PATIENT_TOKEN:0:50}..."
echo ""

# Test API Patient Fields
echo -e "${BLUE}4. Test API GET /api/patient/fields${NC}"
echo "Request: GET $BASE_URL/patient/fields"
echo ""
PATIENT_FIELDS=$(curl -s -X GET "$BASE_URL/patient/fields" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json")

echo -e "${GREEN}=== PATIENT ALL FIELDS RESPONSE ===${NC}"
echo "$PATIENT_FIELDS" | jq '.' 2>/dev/null || echo "$PATIENT_FIELDS"
echo ""
echo "Lưu vào file: patient_fields.json"
echo "$PATIENT_FIELDS" | jq '.' > patient_fields.json 2>/dev/null || echo "$PATIENT_FIELDS" > patient_fields.json
echo ""

echo -e "${GREEN}=========================================="
echo "HOÀN THÀNH! Kiểm tra 2 file:"
echo "  - doctor_fields.json"
echo "  - patient_fields.json"
echo "==========================================${NC}"

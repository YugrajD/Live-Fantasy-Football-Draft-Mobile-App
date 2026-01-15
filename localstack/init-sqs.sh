#!/bin/bash
awslocal sqs create-queue --queue-name draft-events --region us-east-1 || true


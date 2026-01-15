import boto3
import json
from datetime import datetime
from config import settings


sqs_client = None


def get_sqs_client():
    global sqs_client
    if sqs_client is None:
        sqs_client = boto3.client(
            'sqs',
            endpoint_url=settings.sqs_endpoint,
            region_name='us-east-1',
            aws_access_key_id='test',
            aws_secret_access_key='test'
        )
    return sqs_client


async def send_draft_complete_event(room_id: str):
    """Send draft_complete event to SQS queue."""
    try:
        client = get_sqs_client()
        message = {
            "event": "draft_complete",
            "room_id": room_id,
            "timestamp": datetime.now().isoformat()
        }
        
        client.send_message(
            QueueUrl=settings.sqs_queue_url,
            MessageBody=json.dumps(message)
        )
        print(f"Sent draft_complete event for room {room_id} to SQS")
    except Exception as e:
        print(f"Error sending to SQS: {e}")


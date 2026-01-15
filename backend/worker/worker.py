import boto3
import json
import time
import sys
from config import settings
from db.database import async_session
from db.queries import get_room, get_teams_by_room


def get_sqs_client():
    return boto3.client(
        'sqs',
        endpoint_url=settings.sqs_endpoint,
        region_name='us-east-1',
        aws_access_key_id='test',
        aws_secret_access_key='test'
    )


def process_draft_results(room_id: str):
    """Process draft results - calculate team scores, generate grades, etc."""
    print(f"Processing draft results for room {room_id}")
    
    # This is a placeholder - in a real app, you'd:
    # 1. Calculate total fantasy points for each team
    # 2. Generate draft grades
    # 3. Send notifications
    # 4. Store results in database
    
    # For demo, just log the teams
    import asyncio
    async def get_teams():
        async with async_session() as db:
            from uuid import UUID
            room = await get_room(db, UUID(room_id))
            if room:
                teams = await get_teams_by_room(db, UUID(room_id))
                print(f"Room {room_id} - Teams:")
                for user_name, players in teams.items():
                    total_pts = sum(float(p.fantasy_pts) for p in players)
                    print(f"  {user_name}: {len(players)} players, {total_pts:.1f} total fantasy points")
    
    asyncio.run(get_teams())


def process_messages():
    """Poll SQS queue and process messages."""
    sqs = get_sqs_client()
    
    print(f"Worker started, polling queue: {settings.sqs_queue_url}")
    
    while True:
        try:
            response = sqs.receive_message(
                QueueUrl=settings.sqs_queue_url,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=10
            )
            
            messages = response.get('Messages', [])
            
            for message in messages:
                try:
                    body = json.loads(message['Body'])
                    event = body.get('event')
                    
                    if event == 'draft_complete':
                        room_id = body.get('room_id')
                        if room_id:
                            process_draft_results(room_id)
                    
                    # Delete message after processing
                    sqs.delete_message(
                        QueueUrl=settings.sqs_queue_url,
                        ReceiptHandle=message['ReceiptHandle']
                    )
                    print(f"Processed and deleted message: {event}")
                    
                except Exception as e:
                    print(f"Error processing message: {e}")
                    # Delete message even on error to avoid infinite retries
                    try:
                        sqs.delete_message(
                            QueueUrl=settings.sqs_queue_url,
                            ReceiptHandle=message['ReceiptHandle']
                        )
                    except:
                        pass
        
        except KeyboardInterrupt:
            print("Worker shutting down...")
            sys.exit(0)
        except Exception as e:
            print(f"Error in message loop: {e}")
            time.sleep(5)


if __name__ == "__main__":
    process_messages()


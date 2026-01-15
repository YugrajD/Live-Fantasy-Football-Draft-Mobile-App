from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DECIMAL, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from db.database import Base


class Player(Base):
    __tablename__ = "players"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    team = Column(String(10), nullable=False)
    position = Column(String(10), nullable=False)  # QB, RB, WR, TE, K, DEF
    fantasy_pts = Column(DECIMAL(5, 1), default=0)
    
    # Position-specific stats
    pass_yds = Column(Integer, nullable=True)
    pass_td = Column(Integer, nullable=True)
    rush_yds = Column(Integer, nullable=True)
    rush_td = Column(Integer, nullable=True)
    rec_yds = Column(Integer, nullable=True)
    rec_td = Column(Integer, nullable=True)
    fg_made = Column(Integer, nullable=True)
    xp_made = Column(Integer, nullable=True)
    sacks = Column(Integer, nullable=True)
    ints = Column(Integer, nullable=True)
    
    image_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    picks = relationship("Pick", back_populates="player")


class DraftRoom(Base):
    __tablename__ = "draft_rooms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    code = Column(String(6), unique=True, nullable=False)
    status = Column(String(20), default="waiting")  # waiting, drafting, completed
    current_pick = Column(Integer, default=0)
    total_rounds = Column(Integer, default=3)
    turn_time_sec = Column(Integer, default=30)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    participants = relationship("Participant", back_populates="room", cascade="all, delete-orphan")
    picks = relationship("Pick", back_populates="room", cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("draft_rooms.id", ondelete="CASCADE"), nullable=False)
    user_name = Column(String(50), nullable=False)
    draft_position = Column(Integer, nullable=False)
    is_host = Column(Boolean, default=False)
    is_connected = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    room = relationship("DraftRoom", back_populates="participants")
    picks = relationship("Pick", back_populates="participant")
    
    __table_args__ = (
        UniqueConstraint("room_id", "user_name", name="unique_room_user"),
        UniqueConstraint("room_id", "draft_position", name="unique_room_position"),
    )


class Pick(Base):
    __tablename__ = "picks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("draft_rooms.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    pick_number = Column(Integer, nullable=False)
    picked_at = Column(TIMESTAMP, server_default=func.now())
    
    room = relationship("DraftRoom", back_populates="picks")
    participant = relationship("Participant", back_populates="picks")
    player = relationship("Player", back_populates="picks")
    
    __table_args__ = (
        UniqueConstraint("room_id", "pick_number", name="unique_room_pick_number"),
        UniqueConstraint("room_id", "player_id", name="unique_room_player"),
    )


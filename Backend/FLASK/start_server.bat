@echo off
echo Installing Python dependencies...
pip install -r requirements.txt

echo Starting ConcAI Video Server...
python enhanced_video_server.py

pause

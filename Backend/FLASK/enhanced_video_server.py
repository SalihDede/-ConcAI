from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
import os
import subprocess
import re
import json
import time
from threading import Thread
import uuid

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
DOWNLOAD_FOLDER = os.path.normpath(os.path.join(os.path.expanduser("~"), "Downloads", "ConcAI_Videos"))
TEMP_FOLDER = os.path.normpath(os.path.join(os.path.expanduser("~"), "Downloads", "ConcAI_Temp"))

# Create folders
for folder in [DOWNLOAD_FOLDER, TEMP_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

# Track active download processes
active_downloads = {}

def clean_filename(filename):
    """Clean file name"""
    import string
    valid_chars = f"-_.() {string.ascii_letters}{string.digits}"
    return ''.join(c for c in filename if c in valid_chars)

def get_video_info(url):
    """Get video info"""
    try:
        command = ['yt-dlp', '--dump-json', '--no-download', url]
        result = subprocess.run(command, capture_output=True, text=True)
        
        if result.returncode == 0:
            info = json.loads(result.stdout)
            return {
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration', 0),
                'thumbnail': info.get('thumbnail', ''),
                'uploader': info.get('uploader', 'Unknown'),
                'view_count': info.get('view_count', 0),
                'description': info.get('description', '')[:200] + '...' if info.get('description') else ''
            }
    except Exception as e:
        print(f"Error while getting video info: {e}")
    
    return None

def run_yt_dlp(url, format_type, output_file, download_id):
    """Download video with yt-dlp"""
    print(f"Download started: {url}")
    print(f"Format: {format_type}")
    print(f"Output file: {output_file}")
    
    command = ['yt-dlp', '--newline']
    
    if format_type == 'mp3':
        command += ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3']
    elif format_type == 'mp4':
        command += ['-f', 'best[ext=mp4]']
    else:
        command += ['-f', 'best']
    
    command += ['--output', output_file, url]
    
    print(f"Command: {' '.join(command)}")
    
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        active_downloads[download_id] = {
            'process': process,
            'status': 'downloading',
            'progress': 0
        }
        
        progress = 0.0
        for line in process.stdout:
            print(f"yt-dlp output: {line.strip()}" )  # Debug log
            if download_id not in active_downloads:
                process.terminate()
                break
            if "[download]" in line:
                print(f"Progress line: {line.strip()}" )  # Debug log
                # Use regex to extract progress (integer or float)
                progress_match = re.search(r'(\d+(?:\.\d+)?)%', line)
                if progress_match:
                    progress = float(progress_match.group(1)) / 100
                    active_downloads[download_id]['progress'] = progress
                    print(f"Progress: {progress * 100}%" )  # Debug log
                    socketio.emit('download_progress', {
                        'download_id': download_id,
                        'progress': progress,
                        'status': 'downloading'
                    })
            # Extra check for any progress info
            elif "%" in line and ("downloading" in line.lower() or "progress" in line.lower()):
                print(f"Alternative progress line: {line.strip()}" )  # Debug log
                progress_match = re.search(r'(\d+(?:\.\d+)?)%', line)
                if progress_match:
                    progress = float(progress_match.group(1)) / 100
                    active_downloads[download_id]['progress'] = progress
                    print(f"Alternative Progress: {progress * 100}%" )  # Debug log
                    socketio.emit('download_progress', {
                        'download_id': download_id,
                        'progress': progress,
                        'status': 'downloading'
                    })
        
        process.wait()
        
        print(f"Process return code: {process.returncode}")  # Debug log
        
        if process.returncode == 0:
            active_downloads[download_id]['status'] = 'completed'
            active_downloads[download_id]['progress'] = 1.0  # If download is complete, progress is definitely 1.0
            print(f"Download completed: {download_id}")  # Debug log
            # First send progress event
            socketio.emit('download_progress', {
                'download_id': download_id,
                'progress': 1.0,
                'status': 'completed'
            })
            # Then send completed event
            socketio.emit('download_complete', {
                'download_id': download_id,
                'status': 'completed'
            })
            # Cleanup: remove download record
            if download_id in active_downloads:
                del active_downloads[download_id]
        else:
            active_downloads[download_id]['status'] = 'failed'
            print(f"Download failed: {download_id}")  # Debug log
            socketio.emit('download_error', {
                'download_id': download_id,
                'status': 'failed',
                'error': 'Download failed'
            })
            # Cleanup: remove download record
            if download_id in active_downloads:
                del active_downloads[download_id]
            
    except Exception as e:
        active_downloads[download_id]['status'] = 'failed'
        socketio.emit('download_error', {
            'download_id': download_id,
            'status': 'failed',
            'error': str(e)
        })
        # Cleanup: remove download record
        if download_id in active_downloads:
            del active_downloads[download_id]

@app.route('/api/video/test', methods=['POST'])
@cross_origin()
def test_yt_dlp():
    """yt-dlp test endpoint"""
    try:
        data = request.get_json()
        url = data.get('url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')  # Test URL
        # Test yt-dlp installation
        try:
            result = subprocess.run(['yt-dlp', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                yt_dlp_version = result.stdout.strip()
            else:
                return jsonify({'error': 'yt-dlp not found'}), 500
        except Exception as e:
            return jsonify({'error': f'yt-dlp test error: {str(e)}'}), 500
        # Test getting video info
        info = get_video_info(url)
        return jsonify({
            'yt_dlp_version': yt_dlp_version,
            'video_info': info,
            'test_url': url
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/video/info', methods=['POST'])
@cross_origin()
def get_video_info_endpoint():
    """Get video info"""
    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify({'error': 'URL required'}), 400
        info = get_video_info(url)
        if info:
            return jsonify(info)
        else:
            return jsonify({'error': 'Could not get video info'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/video/download', methods=['POST'])
@cross_origin()
def download_video():
    """Start video download process"""
    try:
        data = request.get_json()
        url = data.get('url')
        format_type = data.get('format', 'mp4')
        if not url or format_type not in ['mp3', 'mp4']:
            return jsonify({'error': 'Invalid parameters'}), 400
        # Create unique download ID
        download_id = str(uuid.uuid4())
        # Get video info
        info = get_video_info(url)
        if not info:
            return jsonify({'error': 'Could not get video info'}), 400
        # Clean file name
        clean_title = clean_filename(info['title'])
        filename = f"{clean_title}.{format_type}"
        output_file = os.path.join(DOWNLOAD_FOLDER, filename)
        # Start download process
        download_thread = Thread(
            target=run_yt_dlp,
            args=(url, format_type, output_file, download_id)
        )
        download_thread.start()
        return jsonify({
            'download_id': download_id,
            'filename': filename,
            'status': 'started',
            'video_info': info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/video/status/<download_id>', methods=['GET'])
@cross_origin()
def get_download_status(download_id):
    """Check download status"""
    if download_id in active_downloads:
        download_info = active_downloads[download_id]
        return jsonify({
            'download_id': download_id,
            'status': download_info['status'],
            'progress': download_info['progress']
        })
    else:
        return jsonify({'error': 'Download not found'}), 404

@app.route('/api/video/cancel/<download_id>', methods=['POST'])
@cross_origin()
def cancel_download(download_id):
    """Cancel download process"""
    if download_id in active_downloads:
        download_info = active_downloads[download_id]
        if 'process' in download_info:
            download_info['process'].terminate()
        del active_downloads[download_id]
        return jsonify({'message': 'Download cancelled'})
    else:
        return jsonify({'error': 'Download not found'}), 404

@app.route('/api/video/list', methods=['GET'])
@cross_origin()
def list_downloaded_videos():
    """List downloaded videos"""
    try:
        videos = []
        for filename in os.listdir(DOWNLOAD_FOLDER):
            if filename.endswith(('.mp4', '.mp3')):
                filepath = os.path.join(DOWNLOAD_FOLDER, filename)
                stat = os.stat(filepath)
                videos.append({
                    'filename': filename,
                    'size': stat.st_size,
                    'created': stat.st_ctime,
                    'url': f'/api/video/stream/{filename}'
                })
        return jsonify({'videos': videos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/video/stream/<filename>')
@cross_origin()
def stream_video(filename):
    """Stream video file"""
    try:
        return send_from_directory(DOWNLOAD_FOLDER, filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/api/video/delete/<filename>', methods=['DELETE'])
@cross_origin()
def delete_video(filename):
    """Delete video file"""
    try:
        filepath = os.path.join(DOWNLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({'message': 'Video deleted'})
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'data': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    print(f"Video download folder: {DOWNLOAD_FOLDER}")
    print(f"Temp folder: {TEMP_FOLDER}")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)

import { spawn, exec } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const rmdir = util.promisify(fs.rm);
const execPromise = util.promisify(exec);

/**
 * Creates a video from a list of image URLs and an audio URL using FFmpeg
 * 
 * @param imageUrls Array of image URLs to use as frames
 * @param audioUrl URL of the audio track to use as background
 * @returns URL to the generated MP4 video file
 */
export async function createVideoFromImagesAndAudio(
  imageUrls: string[],
  audioUrl: string
): Promise<string> {
  console.log("Starting video creation process with FFmpeg");
  
  // Create a temporary directory
  const tempDir = path.join(
    process.env.TMPDIR || '/tmp',
    `birthday-video-${uuidv4()}`
  );
  console.log(`Created temp directory: ${tempDir}`);
  fs.mkdirSync(tempDir, { recursive: true });
  
  try {
    // Filter out invalid URLs
    const validImageUrls = imageUrls.filter(url => url && typeof url === 'string');
    console.log(`Found ${validImageUrls.length} valid image URLs out of ${imageUrls.length} provided`);
    console.log(`First few valid URLs: ${JSON.stringify(
      validImageUrls.slice(0, 2).map(url => url.substring(0, 40) + '...')
    )}`);
    
    // Download and process images
    const imageFiles = [];
    for (let i = 0; i < validImageUrls.length; i++) {
      const url = validImageUrls[i];
      if (!url) continue; // Skip if URL is undefined
      
      console.log(`Downloading image ${i} from: ${url.substring(0, 40)}...`);
      
      try {
        // Using native fetch API available in Next.js 15
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        
        const buffer = await response.arrayBuffer();
        
        // Process with sharp to ensure JPEG format
        const outputPath = path.join(tempDir, `image${String(i).padStart(3, '0')}.jpg`);
        await sharp(Buffer.from(buffer))
          .resize(1364, 1024) // Ensure even dimensions
          .jpeg()
          .toFile(outputPath);
          
        console.log(`Saved image ${i} to ${outputPath}`);
        imageFiles.push(outputPath);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error processing image ${i}:`, errorMessage);
      }
    }
    
    if (imageFiles.length === 0) {
      throw new Error("No valid images could be processed");
    }
    
    console.log(`Successfully downloaded and processed ${imageFiles.length} images`);
    
    // Download audio
    console.log(`Downloading audio from: ${audioUrl.substring(0, 40)}...`);
    let audioPath = ''; // Define audioPath variable outside the try block
    let audioDuration = 0;

    try {
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      audioPath = path.join(tempDir, 'audio.mp3');
      fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
      console.log(`Saved audio to ${audioPath}`);

      // Get audio duration using ffprobe
      console.log(`Getting audio duration for: ${audioPath}`);
      try {
        const { stdout } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`);
        audioDuration = parseFloat(stdout.trim());
        if (isNaN(audioDuration) || audioDuration <= 0) {
          throw new Error("Invalid audio duration detected.");
        }
        console.log(`Detected audio duration: ${audioDuration} seconds`);
      } catch (ffprobeError: unknown) {
        const errorMessage = ffprobeError instanceof Error ? ffprobeError.message : String(ffprobeError);
        console.error(`Failed to get audio duration using ffprobe: ${errorMessage}`);
        throw new Error(`Failed to get audio duration: ${errorMessage}`);
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to download or probe audio: ${errorMessage}`);
    }

    // Calculate necessary framerate based on audio duration and number of images
    const numImages = imageFiles.length;
    const imageDuration = audioDuration / numImages;
    const framerate = 1 / imageDuration;
    console.log(`Calculated image duration: ${imageDuration}s, Framerate: ${framerate} fps`);

    // Output video path
    const outputPath = path.join(tempDir, 'output.mp4');
    console.log(`Output video will be saved to: ${outputPath}`);
    
    // Construct FFmpeg command
    const ffmpegArgs = [
      '-y', // Overwrite output files without asking
      '-framerate', `${framerate}`, // Input framerate based on calculation
      '-i', path.join(tempDir, 'image%03d.jpg'), // Input images sequence
      '-i', audioPath, // Input audio file
      '-c:v', 'libx264', // Video codec
      '-profile:v', 'baseline', // H.264 profile for broad compatibility
      '-level', '3.0', // H.264 level
      '-pix_fmt', 'yuv420p', // Pixel format for compatibility
      '-c:a', 'aac', // Audio codec
      '-strict', 'experimental', // Needed for AAC codec in older ffmpeg versions
      '-b:a', '192k', // Audio bitrate
      '-t', `${audioDuration}`, // Set exact output duration to audio duration
      '-map', '0:v', // Map video stream from first input (images)
      '-map', '1:a', // Map audio stream from second input (audio)
      outputPath // Output file path
    ];
    
    console.log(`Running FFmpeg with args: ${ffmpegArgs.join(' ')}`);
    
    // Run FFmpeg
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      let stderr = '';
      
      ffmpeg.stdout.on('data', (data) => {
        console.log(`FFmpeg: ${data}`);
      });
      
      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.log(`FFmpeg: ${output}`);
      });
      
      ffmpeg.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        
        if (code !== 0) {
          reject(new Error(`FFmpeg process exited with code ${code}: ${stderr}`));
          return;
        }
        
        // Read the output video as a data URL
        try {
          const videoBuffer = fs.readFileSync(outputPath);
          const dataUrl = `data:video/mp4;base64,${videoBuffer.toString('base64')}`;
          resolve(dataUrl);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          reject(new Error(`Failed to read output video: ${errorMessage}`));
        }
      });
    });
  } catch (error) {
    console.error("Error in video creation:", error);
    throw error;
  } finally {
    // Clean up temp directory (can be commented out for debugging)
    // fs.rmSync(tempDir, { recursive: true, force: true });
  }
} 
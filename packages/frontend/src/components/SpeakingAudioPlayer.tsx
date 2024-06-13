import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface ComponentProps {
  urls: string[];
  height: number;
  onFinish?: () => void;
}

export const SpeakingAudioPlayer: React.FC<ComponentProps> = ({
  urls,
  height,
  onFinish,
}) => {
  const wavesurferContainerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    if (urls.length && wavesurferContainerRef.current) {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      wavesurferRef.current = WaveSurfer.create({
        container: wavesurferContainerRef.current,
        waveColor: '#9ca3af',
        progressColor: '#92C7CF',
        height: height,
        interact: false,
        // Bar look
        barWidth: 5,
        barRadius: 4,
        barGap: 3,
      });
    }

    wavesurferRef.current?.on('finish', () => {
      onFinish?.();

      setTrackIndex(prevIndex => {
        if (prevIndex < urls.length - 1) {
          setAudioPlayed(false); // Reset audioPlayed for the next track
          return prevIndex + 1;
        } else {
          return prevIndex;
        }
      });
    });

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    wavesurferRef.current?.load(urls[trackIndex]);
  }, [trackIndex]);

  const handlePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.play();
      setAudioPlayed(true);
    }
  };

  return (
    <div className="flex flex-col w-full items-center">
      <span className="px-4 text-xl font-bold mb-8">
        Question {trackIndex + 1}
      </span>
      <div
        ref={wavesurferContainerRef}
        style={{ height: height }}
        className="w-full mb-8"
      />
      {!audioPlayed && (
        <button
          type="button"
          className="focus:outline-none text-white bg-green-600
            hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium
            rounded-lg text-sm px-3 h-10 ml-2 dark:bg-green-600
            dark:hover:bg-green-700 dark:focus:ring-green-800"
          onClick={handlePlay}
        >
          Play
        </button>
      )}
    </div>
  );
};

# Render Output

# Introduction

first step in rendering process is to determine and set output settings. This includes render size, frame rate, pixel aspect ratio, output location, and file type.
When rendering single frame, output should be single image format and not video. Several image formats are available.
Images can also be used for rendering animations which has couple advantages. For example, when rendering animations to image file formats render job can be canceled and resumed at last rendered frame by changing frame range. This is useful if animation takes long time to render and computers resources are needed for something else.
Images can then be encoded to video by adding rendered image sequence into Video Sequencer and choosing appropriate Video Output .
Tip
Rendered image sequences can be played back in Animation Player .
See also
See Render Menu

---

# Rendering Animations

While rendering stills will allow you to view and save image from render buffer when it is complete, animations are series of images, or frames, and are automatically saved directly out to drive after being rendered.
After rendering frames, you may need to edit clips, or first use Compositor to do green-screen masking, matting, color correction, DOF, and so on to images. That result is then fed to Sequencer where strips are cut and mixed and final overlay is done.
Finally you can render out from Sequencer and compress frames into video file.

## Workflow

You do lot of intermediate renders of different frames in your animation to check for timing, lighting, placement, materials, and so on. At some point, you are ready to make final render of complete animation for publication.
There are two approaches you can use when making movie, or animation, with or without sound. approach use depends on amount of CPU time you will need to render movie. You can render “typical” frame at desired resolution, and then multiply by number of frames that will ultimately go into movie, to arrive at total render time.

If total render time is hour or more, you want to use “Frame Sequence” approach. For example, if you are rendering one-minute video clip for film, there will be (60 seconds per minute) X (24 frames per second) or 1440 frames per minute. If each frame takes 30 seconds to render, then you will be able to render two frames per minute, or need 720 minutes (12 hours) of render time.

Rendering takes all available CPU time; render overnight, when computer is not needed, or set Blender to low priority while rendering, and work on other things (be careful with RAM space!).
Direct Approach

Direct Approach, which is highly **not** recommended and not standard practice, is where you set your output format to AVI or MOV format, and click*Animation *to render your scene directly out to movie file. Blender creates one file that holds all frames of your animation. You can then use Blender’s Video Sequencer to add audio track to animation and render out to MPEG format to complete your movie.
Frame Sequence

Frame Sequence is much more stable approach, where you set your output format to still format (such as JPG, PNG or multi-layer format). Click*Animation *to render your scene out to set of images, where each image is frame in sequence.

Blender creates file for each frame of animation. You can then use Blender’s Compositor to perform any frame manipulation (post-processing). You can then use Blender’s Video Sequencer to load that final image sequence, add audio track to animation, and render out to MPEG format to complete your movie. Frame Sequence approach is little more complicated and takes more drive space, but gives you more flexibility.
Here are some guidelines to help you choose approach.
Direct Approach

- Short segments with total render time under one hour.
- Stable power supply.
- Computer not needed for other uses.
  Frame Sequence Approach
- Total render time over one hour.
- Post-production work needed:
- Color/lighting adjustment
- Green screen/matte replacement
- Layering/compositing
- Multiple formats and resolutions of final product
- Intermediate frames/adjustments needed for compression/codec.
- Precise timing (e.g. lip-sync to audio track) needed in parts.
- May need to interrupt rendering to use computer, and want to be able to resume rendering where you left off.

## Frame Sequence Workflow

- First prepare your animation.
- In*Format *panel, choose render size, Pixel Aspect Ratio, and Range of Frames to use, as well as frame rate, which should already be set.
- In Output panel set up your animation to be rendered out as images, using format that does not compromise any quality.
- Choose output path and file type in Output panel as well, for example `//render/my-anim- `.
- Confirm range of your animation (frame Start and End).
- Save your blend-file.
- Press*Animation *button and once animation is finished, use your file manager to navigate to output folder ( `render `in this example). You will see lots of images that have sequence number attached to. These are single frames.
- In Blender, open Video Sequencer .
  Note
  Video Sequencer does not support multi-layer EXR files. To render to video format you will have to skip next three steps and instead use Image Input node in Compositor .
- Choose*Add Image *from add menu. Select all frames from your output folder that you want to include in your animation. They will be added as strip in Sequence editor.
- Now you can edit strip and add effects or leave it like it is. You can add other strips, like audio strip.
- Scrub through animation to check if you have included all frames.
- In Output panel, choose container and codec you want (e.g. `MPEG H.264 `) and configure them. video codecs are described in Output Options .
- Click*Animation *render button and Blender will render out Sequence editor output into movie.

## Hints\*\*

Your computer accidentally turns off in middle of rendering your movie!\**Unless your animation renders in few minutes, it is best to render animation as separate image files. Instead of rendering directly to compressed movie file, use lossless format (e.g. `PNG `).
This allows you easy recovery if there is problem and you have to re-start rendering, since frames you have already rendered will still be in output directory. Disable *Overwrite\* option to start rendering where you left off.

You can then make movie out of separate frames with Blender’s Sequence editor or use 3rd party encoding software.
**Animation Preview**It can be useful to render subset of animated sequence, since only part of animation may have error.

Using image format for output, you can use*Frame Step*option to render every *N’th*frame. Then disable _Overwrite_ and re-render with *Frame Step*set to 1.

- Rendering Animations
- Workflow
- Frame Sequence Workflow
- Hints

---
layout: post
title: "Support for new hardware"
date: "2020-11-19"
image: "post_default_header.jpg"
tags: 
  - "opendeck"
  - "announce"
image: "blackpill411.jpg"
comments: true
---

Latest OpenDeck firmware now supports two new STM32F4 boards, commonly known as "Black Pill" - the one with STM32F401 and STM32F411 MCUs. These are very powerful boards and their MCU is very similar to the one I'm already using for all my new controllers and also new OpenDeck board.

They are also very cheap (can be found on eBay for ~4$). More information about these boards can he found [here](https://stm32-base.org/boards/STM32F401CEU6-WeAct-Black-Pill-V3.0). These boards are great alternative to small Arduino Micro boards which aren't supported anymore since OpenDeck cannot fit into its flash memory.

On the Arduino side of things, [Mux Shield 2](http://mayhewlabs.com/products/mux-shield-2) is now supported for Arduino Mega. This shield adds 48 analog inputs to Arduino Mega, which should be more than enough for most people (it's even more than official OpenDeck board!).

![]({{ site.baseurl }}/images/blog/mux_shield2.jpg)

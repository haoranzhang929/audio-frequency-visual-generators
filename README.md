# Audio Frequency Graph Generator

Audio Frequency Graph Generator is a reference tool for people who want to do web-based audio visualization.

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu) [![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

## Getting Started

1. Select buffer size
2. Add or remove frequency bins according to the needs
3. Load sample track or choose an local audio file
4. Click play to generate real-time frequency graph

[Demo Page](http://ec2-52-213-180-139.eu-west-1.compute.amazonaws.com/)

Default buffer size: 512

Default frequency bins: [0, 5, 10, 50, 100, 200, 300, 400, 500]

## Built With

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/) - To analyse the audio's frequency data in real-time
- [Plotly.js](https://plot.ly/javascript/) - Used to draw frequency data
- [Materialize](https://materializecss.com/) - Used for the UI

## Credit

Sample Audio: _[In My Clouds](https://soundcloud.com/lakeyinspired/in-my-clouds) by [LAKEY INSPIRED](https://soundcloud.com/lakeyinspired)_

## Author

[Haoran Zhang](https://haoranzhang.me/)

## License

This project is licensed under the MIT and Anti 996 License - see the [MIT LICENSE](LICENSE) and [ANTI 996 LICENSE](LICENSE_ANTI_996) file for details

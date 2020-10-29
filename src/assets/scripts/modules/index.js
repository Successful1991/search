// import $ from 'jquery'
// import slick from 'slick-carousel'


// let recognition = new SpeechRecognition();

function init() {
    let lang = {
        uk: "uk",
        ru: "ru-RU",
        en: "en-US"
    };

    const langName = lang[document.querySelector("html").lang];
    // sliders init start
    let requireList = [];

    getList('wp-content/themes/search/static/list-'+ langName +'.json')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    // const grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colorsList.join(' | ') + ' ;';
    const recognition = new SpeechRecognition();
    // recognition.lang = 'uk';
    // recognition.lang = 'ru-RU';
    // recognition.lang = 'en-EN';
    recognition.lang = langName;
    const speechRecognitionList = new SpeechGrammarList();
    // speechRecognitionList.addFromString(grammar, 1);
    const microphoneIcon = document.querySelector('.js-search__micro');
    const microphoneIconEnd = document.querySelector('.js-search__micro-end');
    const resultWrap = document.querySelector('.js-search__result');

    $(".js-search__close").on('click', function () {
       $(this).closest('.js-search').removeClass('my-search__active')
    });

    $(".js-search-start").on('click', function () {
       $('.js-search').addClass('my-search__active')
    });

    microphoneIcon.addEventListener('click', function() {
        recognition.start();
    });

    microphoneIconEnd.addEventListener('click', function() {
        recognition.stop();
        microphoneIconEnd.classList.remove('active');
        microphoneIcon.classList.add('active');
        // microphoneIcon.style.visibility = 'visible';
        // microphoneIconEnd.style.visibility = 'hidden';
    });

    $('.js-search__text').on('input',function (ev) {
        resultWrap.innerHTML = '';
        if(this.value.length < 3) return

        search(this.value)
    })

    recognition.onaudiostart = function() {
        microphoneIcon.classList.remove('active');
        microphoneIconEnd.classList.add('active');
        // microphoneIcon.style.visibility = 'hidden';
        // microphoneIconEnd.style.visibility = 'visible';
    };

    function getColor(speechResult) {
        let result = [];
        for(element in requireList){
            if ( requireList[element].request.includes(speechResult) ) {
                result.push({
                    link:requireList[element].link,
                    text: requireList[element].request,
                    category: requireList[element].category
                });
            }
            // requireList[element].request.forEach(el => {
            //
            // })
        }
        return (result.length) ? result: null;
    }
    // function getColor(speechResult) {
    //     for (let index = 0; index < colorsList.length; index += 1) {
    //         if (speechResult.indexOf(colorsList[index]) !== -1) {
    //             const colorKey = colorsList[index];
    //             return [colorKey, colors[colorKey]];
    //         }
    //     }
    //     return null;
    // }

    recognition.onresult = function(event) {
        const last = event.results.length - 1;
        search(event.results[last][0].transcript);
    };

    recognition.onspeechend = function() {
        recognition.stop();
        microphoneIconEnd.classList.remove('active');
        microphoneIcon.classList.add('active');
        // microphoneIcon.style.visibility = 'visible';
        // microphoneIconEnd.style.visibility = 'hidden';
    };

    function getList(url) {
        $.ajax({url,
        success: function (data) {
            console.log(112);
            console.log(113,data);

            requireList = data;
        }
        })

    }

    function setResult(result) {
        if(!result || result.length < 1) {
            return `<div class="my-search__result-empty">${resultWrap.dataset.empty}</div>`
        }

        return result.reduce((previous, current) => {
            return `${previous} <div class="my-search__result-elem"><a href="${current.link}">${current.text}</a><span>${current.category}</span></div>`
        },``)
    }

    function search(text) {
        $('.js-search__text').val(text);
        resultWrap.innerHTML = setResult(getColor(text))
    }
}






document.addEventListener('DOMContentLoaded',function () {
    init();
});

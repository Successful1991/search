function init() {

    let langList = {
        uk: "uk",
        ru: "ru-RU",
        en: "en-US"
    };
    const empty = {
        uk: 'Нічого не знайдено',
        ru: 'Ничего не найдено',
        en: 'Nothing found'
    }
    // const separatorsForSearch = [',', ' ', ';']

    let lang = document.querySelector("html").lang;
    // 'wp-content/themes/search/static/list_'+ newLang +'.json'
    const hrefCur = '/wp-content/themes/search/static';
    // const hrefCur = '/exelparse/json/list__'+ lang +'.json';
    const langName = langList[lang];
    const objRegByLang = {
        uk: /([аоуеиі])+$/gim,
        ru: /([аеийоуэыюяуюь])+$/gim
    }
    // sliders init start
    let requireList = [];
    $(`.js-my-search__lang-button [data-lang=${lang}]`).addClass('active')
    getList(hrefCur + '/list_'+ lang +'.json')
    // getList('wp-content/themes/search/static/list_'+ lang +'.json')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
    if(SpeechRecognition && SpeechGrammarList && SpeechRecognitionEvent) {
        const speechRecognitionList = new SpeechGrammarList();
        // const grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colorsList.join(' | ') + ' ;';
        const recognition = new SpeechRecognition();
        recognition.lang = langName;

        const microphoneIcon = document.querySelector('.js-search__micro');
        const microphoneIconEnd = document.querySelector('.js-search__micro-end');
        microphoneIcon.classList.add('active')
        microphoneIcon.addEventListener('click', function() {
            recognition.start();
        });

        microphoneIconEnd.addEventListener('click', function() {
            recognition.stop();
            
            microphoneIconEnd.classList.remove('active');
            microphoneIcon.classList.add('active');
        });

        recognition.onaudiostart = function() {
            microphoneIcon.classList.remove('active');
            microphoneIconEnd.classList.add('active');
        };

        recognition.onresult = function(event) {
            const last = event.results.length - 1;
            search(event.results[last][0].transcript);
        };

        recognition.onspeechend = function() {
            recognition.stop();
            microphoneIconEnd.classList.remove('active');
            microphoneIcon.classList.add('active');
        };

        recognition.onerror = function (event) {
            $('.js-my-search__help-micro').addClass('my-active')
            new SpeechRecognition();
        }
    } else {
        document.querySelector('.js-search__micro').classList.remove('active')
    }

    // speechRecognitionList.addFromString(grammar, 1);
    $('.js-my-search__help-micro--close').on('click', function () {
        $('.js-my-search__help-micro').removeClass('my-active')
    })
    const resultWrap = document.querySelector('.js-search__result');

    document.querySelector(".js-search__close").addEventListener('click', function () {
        document.querySelector('.js-search').classList.remove('my-search__active')
    });

    document.querySelector(".js-search-start").addEventListener('click', function () {
        document.querySelector('.js-search').classList.add('my-search__active')
    });

    document.addEventListener('keydown', function (event) {
        if(! document.querySelector('.js-search').classList.contains('my-search__active')) {
            return
        }
        if(event.keyCode === 27) {
            document.querySelector('.js-search').classList.remove('my-search__active')
        }
    })

    document.querySelector('.js-search__text').addEventListener('input',function (ev) {
        resultWrap.innerHTML = '';
        if(this.value.length < 3) return
        search(this.value)
    })

    $('.js-my-search__lang-button').on('click', 'button', function () {
        lang = this.dataset.lang
        $('.js-my-search__lang-button .active').removeClass('active')
        this.classList.add('active')
        getList(hrefCur + '/list_'+ lang +'.json', () => {
            if($('.js-search__text')[0].value < 3) return
            search( $('.js-search__text')[0].value)
        })

    })


    function checkResult(speechResult) {
        const regex = new RegExp(/[\s;,]+/g);
        speechResult = speechResult.trim().split(regex).filter(el => { if(el.length > 2) return el})
        let result = [];

            for(let element in requireList) {
                // if( speechResult.every(el => requireList[element].request.toLowerCase().includes(el.toLowerCase().replace(objRegByLang[lang], '')) ) ) {
                //     result.push({
                //         link:requireList[element].link,
                //         text: requireList[element].request,
                //         category: requireList[element].category
                //     });
                // }
                // const add = speechResult.some(el => {
                //     if( requireList[element].request.toLowerCase().includes(el.toLowerCase().replace(objRegByLang[lang], '')) ){
                //         console.log('index++', requireList[element].request )
                //
                //         index++
                //         return true
                //     }
                //     return false
                // })
                let index = 0
                let add = false
                speechResult.forEach(el => {
                    if( requireList[element].request.toLowerCase().includes(el.toLowerCase().replace(objRegByLang[lang], '')) ){
                        index++
                        add = true
                    }
                })

                if( add ) {
                    result.push({
                        link:requireList[element].link,
                        text: requireList[element].request,
                        category: requireList[element].category,
                        index: index === speechResult.length ? 1 : 2
                    });
                }
            }

        return (result.length) ? result: null;
    }

    function getList(url, callback = () => {}) {
        const rawFile = new XMLHttpRequest();
        rawFile.open("GET", url, false);
        rawFile.onreadystatechange = function () {
            if(rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)) {
                 requireList = JSON.parse(rawFile.responseText);
                callback()
            }
        }
        rawFile.send(null);


        // $.ajax(url).done(function (data) {requireList = data})
    }

    function setResult(result) {
        if(!result || result.length < 1) {
            return `<div class="my-search__result-empty">${empty[lang]}</div>`
        }

        return result.reduce((previous, current) => {
            return `${previous} <div class="my-search__result-elem" style="order: ${current.index}"><a href="${current.link}">${current.text}</a><span>${current.category}</span></div>`
        },``)
    }

    function search(text) {
        document.querySelector('.js-search__text').value = text;
        resultWrap.innerHTML = setResult(checkResult(text))
    }
}

document.addEventListener('DOMContentLoaded',function () {
    init();
});

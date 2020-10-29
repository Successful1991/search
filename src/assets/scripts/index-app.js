import * as THREE from 'three/build/three.module.js';
import { gsap } from "gsap";
// import { ExpoScaleEase, RoughEase, SlowMo } from "gsap/EasePack";
// import { CSSRulePlugin } from "gsap/CSSRulePlugin";
// import { MotionPathPlugin } from "gsap/MotionPathPlugin";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// gsap.registerPlugin(CSSRulePlugin, MotionPathPlugin, ScrollToPlugin, ExpoScaleEase, RoughEase, SlowMo);



let slidesData;
const displacementSlider = function(opts) {

    let vertex = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

    let fragment = `
    
    varying vec2 vUv;

    uniform sampler2D currentImage;
    uniform sampler2D nextImage;

    uniform float dispFactor;

    void main() {

        vec2 uv = vUv;
        vec4 _currentImage;
        vec4 _nextImage;
        float intensity = 0.3;

        vec4 orig1 = texture2D(currentImage, uv);
        vec4 orig2 = texture2D(nextImage, uv);
        
        _currentImage = texture2D(currentImage, vec2(uv.x, uv.y + dispFactor * (orig2 * intensity)));

        _nextImage = texture2D(nextImage, vec2(uv.x, uv.y + (1.0 - dispFactor) * (orig1 * intensity)));

        vec4 finalTexture = mix(_currentImage, _nextImage, dispFactor);

        gl_FragColor = finalTexture;

    }
`;

    let images = opts.images, image, sliderImages = [];
    let img = images[0].size;

    let parent = document.getElementsByClassName(opts.parent)[0];
    let renderWidth = Math.max(window.innerWidth || 0);
    let renderHeight = Math.max(window.innerHeight || 0);
    let currentSlide = 0;
    let {w:renderW, h:renderH} = getSize(img);

    let renderer = new THREE.WebGLRenderer({
        antialias: false,
    });

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor( 0x23272A, 1.0 );
    renderer.setSize( renderW, renderH );
    parent.appendChild( renderer.domElement );

    let loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    $('.js-view__amount-all').html(images.length);
    images.forEach( ( img ) => {
        image = loader.load( img.image );
        // image = loader.load( img.getAttribute( 'src' ) + '?v=' + Date.now() );
        image.magFilter = image.minFilter = THREE.LinearFilter;
        image.anisotropy = renderer.capabilities.getMaxAnisotropy();
        sliderImages.push( image );
    });

    let scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x23272A );
    let camera = new THREE.OrthographicCamera(
        renderWidth / -2,
        renderWidth / 2,
        renderHeight / 2,
        renderHeight / -2,
        1,
        1000
    );

    camera.position.z = 1;

    let mat = new THREE.ShaderMaterial({
        uniforms: {
            dispFactor: { type: "f", value: 0.0 },
            currentImage: { type: "t", value: sliderImages[0] },
            nextImage: { type: "t", value: sliderImages[1] },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        opacity: 1.0
    });

    let geometry = new THREE.PlaneBufferGeometry(
        parent.offsetWidth,
        parent.offsetHeight,
        1
    );
    let object = new THREE.Mesh(geometry, mat);
    object.position.set(0, 0, 0);
    scene.add(object);

    let addEvents = function(){
        let isAnimating = false;
        $('.js-view__right').on('click', function() {
            (currentSlide+1 === images.length) ? changeSlide(0) : changeSlide(currentSlide+1);
        });
        $('.js-view__left').on('click', function() {
            (currentSlide === 0) ? changeSlide(images.length-1) : changeSlide(currentSlide-1);
        });
        function changeSlide(next) {
            if( !isAnimating ) {
                $('.js-view__amount-current').html(next+1);
                currentSlide = next;
                isAnimating = true;
                mat.uniforms.nextImage.value = sliderImages[next];
                mat.uniforms.nextImage.needsUpdate = true;
                gsap.to( mat.uniforms.dispFactor, 1, {
                    value: 1,
                    ease: 'Expo.easeInOut',
                    onComplete: function () {
                        mat.uniforms.currentImage.value = sliderImages[next];
                        mat.uniforms.currentImage.needsUpdate = true;
                        mat.uniforms.dispFactor.value = 0.0;
                        isAnimating = false;
                    }
                });
            }
        }
    };

    addEvents();
    window.addEventListener( 'resize' , function(e) {
        updateSizeCanvas(images[currentSlide].size);
    });

    function getSize(img={height:1920,width:980}) {
        renderWidth = Math.max(window.innerWidth || 0);
        renderHeight = Math.max(window.innerHeight || 0);
        let ratio = img.width/img.height;
        let renderW, renderH;
        renderH = renderHeight;
        renderW = renderHeight*ratio;
        if(renderWidth > renderW){
            let ratio = img.height/img.width;
            renderH = renderWidth*ratio;
            renderW = renderWidth;
        }
        return {w: renderW, h:renderH}
    }

    function updateSizeCanvas(img) {
        let {w:renderW, h:renderH} = getSize(img);
        renderer.setSize(renderW, renderH);
    }

    let animate = function() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();
};

function getConf(url) {
    $.ajax({
        url: url,
        method: 'POST',
        data: {action: 'viewSlider'},
    }).done(function (response) {
        let conf = {
            parent: "js-view__slider",
            images: JSON.parse(response)
        };
        new displacementSlider(conf);
    })
}

function getConfig(url) {
    $.ajax(url).done(function (response) {
        let conf = {
            parent: "js-view__slider",
            images: response
        };
        new displacementSlider(conf);
    })
}

document.addEventListener('DOMContentLoaded',function () {

    getConfig('/wp-content/themes/pokrovsky/static/viewSlider.JSON');
});

// (function () {
    // getConf('/wp-admin/admin-ajax.php');
// })();

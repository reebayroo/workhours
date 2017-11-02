import $ from 'jquery';

import mustache from 'mustache';
import axios from 'axios';
import _ from 'lodash';


let id = 31001,
  addVehicle = (year, model, videos) => {
    let vehicleId = id++,
      wrapId = (video) => _.merge({ vehicleId: vehicleId }, video)
    return {
      id: vehicleId,
      year: year,
      model: model,
      title: `Year: ${year} Model: ${model}`,
      recentVideos: [],
      videos: _.map(videos, wrapId) || [],
      hasVideos: !_.isEmpty(videos)
    }
  },
  video = (title, url) => ({
    id: id++,
    title: title,
    url: url,
  }),

  model = {
    vehicles: [
      addVehicle(2018, '370Z', [
        video('Power Windows', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/1h/J6SXM6tbMOKLCAwhp0O9IIG2Erayhn7KKsGfF827E/18z_cv-11_powerwindows.mp4'),
        video('Intelligent Key Remote Battery Replacement', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/-0/n678vQkqia5LxFL-gSICswZQjsjfkcBHPr8-DGVRA/18z_vc-09_ikeybattery.mp4'),
        video('Automatic Door Locks', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/T9/qYeoflrF3Mza-1X4rogFv6KpsiVpl8ZmldPI9CYYY/18z_cv-02_doorlocks.mp4'),
        video('Intelligent Key and Locking Functions', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/C-/1gPcyRfo1BRhN7ouFAhP6hSbTnZCk-OuN6Mhk1uCQ/18z_vc-08_ikey.mp4'),
        video('Outside Mirror Adjustments', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/q1/4YYTVimBP_QFIpVrZbklIbP4h888BVWF0fPCwZFsk/18z_cv-09_mirroradjust.mp4'),
      ]),
      addVehicle(2018, 'Versa'),
      addVehicle(2018, 'Armada'),
      addVehicle(2017, 'Armada', [
        video('Headlights and Exterior Lights', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/qI/RPY-JXe3uO1ChWMtijkRU1qzEOD3JOlk2OM95ISUk/17ar_vc-05_headlights.mp4'),
        video('Predictive Forward Collision Warning (PFCW) and Forward Emergency Braking (FEB)', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/IE/qNAcVXwTrKorUQxZLKjtXmZ3WlnRlKaEEkTHPN6dM/17ar_sa-10_predictfcw.mp4'),
        video('Front and Rear Sonar', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/AC/gQeuHUXozVhrMWIi18NdH0Pp_N0AjjUDkTSAVNCbs/17ar_sa-06_frontrearsonar.mp4'),
        video('Hill Start Assist', 'https://s2.content.video.llnw.net/smedia/1462487a0ed04e85a5f4f26ea88f9aba/-j/TQLHdh-RMm_xYmSMUu1SssY2kAsDI1MKh71oE72e0/17ar_sp-03_hillstart.mp4'),
      ]),
      addVehicle(2017, 'LEAF'),
      addVehicle(2017, 'Maxima'),
      addVehicle(2017, 'Sentra'),
    ]
  },
  vehicleSelectionTemplate,
  singleVideoTemplate,
  videosTemplate,
  favoritesTemplate,
  recentVideosTemplate,
  currentVehicle;



function setLoading(flag) {
  if (flag) $('#loader').show();
  else $('#loader').hide();
}



function load() {
  vehicleSelectionTemplate = $('#vehiclesTemplate').html();
  videosTemplate = $('#videosTemplate').html();
  singleVideoTemplate = $('#singleVideoTemplate').html();
  favoritesTemplate = $('#favoritesTemplate').html();
  recentVideosTemplate = $('#recentVideosTemplate').html();
  // totalsTemplate = $('#totalsTemplate').html();

  mustache.parse(vehicleSelectionTemplate);
  mustache.parse(videosTemplate);
  mustache.parse(singleVideoTemplate);
  mustache.parse(favoritesTemplate);
  mustache.parse(recentVideosTemplate);
  // mustache.parse(totalsTemplate);

  // body...
  console.log('load', $('.tabular.menu .item').length);
  $('.tabular.menu .item').tab({
    'onVisible': (tabName) => {
      if (tabName === 'tabVideos') refreshVideos(currentVehicle);
      if (tabName === 'tabFavorites') refreshFavorites(currentVehicle);
      if (tabName === 'tabRecent') refreshRecent(currentVehicle);
    }
  });
  refreshVehicles();
  // bindSubmitHours();
}

function refreshVehicles() {
  console.log('refreshVehicles', model.vehicles);
  let processedHtml = mustache.render(vehicleSelectionTemplate, {
    vehicles: model.vehicles
  });
  $('#vehiclesTemplateTarget').html(processedHtml).ready(rebindVehicles);
}

function rebindVehicles() {
  $('#vehiclesTemplateTarget a.header').click(vehicleSelected);
}

function vehicleSelected(e) {
  console.log('vehicleSelected');

  let id = $(this).data('id'),
    vehicle = _.find(model.vehicles, { id: id });

  $(this).addClass('active');
  console.log('vehicle selected', { id: id }, vehicle);
  currentVehicle = vehicle
  updateState();
  refreshVideos(vehicle);
}

function refreshVideos(vehicle) {
  console.log('refreshing Videos', vehicle);
  let processedHtml = mustache.render(videosTemplate, {
    title: vehicle && vehicle.title || 'Select Vehicle',
    videos: vehicle && vehicle.videos,
  });
  $('#videosTemplateTarget').html(processedHtml).ready(rebindVideos);
}

function refreshFavorites(vehicle) {
  console.log('refreshing Videos', vehicle);
  let processedHtml = mustache.render(favoritesTemplate, {
    title: vehicle && vehicle.title || 'Select Vehicle',
    videos: vehicle && vehicle.videos && _.filter(vehicle.videos, { favorite: true }),
  });
  $('#favoritesTemplateTarget').html(processedHtml).ready(rebindFavoriteVideos);
}

function refreshRecent(vehicle) {
  console.log('refreshing Recent Videos', vehicle);
  let processedHtml = mustache.render(recentVideosTemplate, {
    title: vehicle && vehicle.title || 'Select Vehicle',
    videos: vehicle && vehicle.recentVideos,
  });
  $('#recentTemplateTarget').html(processedHtml).ready(rebindRecentVideos);
}

function rebindFavoriteVideos() {
  $('#favoritesTemplateTarget a.header').click(videoSelected('#favoritesTemplateTarget'))
  $('#favoritesTemplateTarget i.large.cancel').click(cancelFavorites)
}

function cancelFavorites() {
  let videoId = $(this).data('video-id'),
    video = _.find(currentVehicle.videos, { id: videoId });
  delete video.favorite
  updateState();
  setTimeout(() => refreshFavorites(currentVehicle), 500);

}

function rebindVideos() {
  $('#videosTemplateTarget a.header').click(videoSelected('#videosTemplateTarget'))
}

function rebindRecentVideos() {
  $('#recentTemplateTarget a.header').click(videoSelected('#recentTemplateTarget'))
}


function videoSelected(parentTarget) {
  return function(e) {
    let videoId = $(this).data('video-id'),
      video = _.find(currentVehicle.videos, { id: videoId });
    refreshSingleVideo(parentTarget, currentVehicle, video)
  }
}

function refreshSingleVideo(parentTarget, vehicle, video) {
  console.log('refreshing Single', parentTarget, $(`${parentTarget} .singleVideoTemplateTarget`).length, vehicle);
  console.log(' Single', parentTarget, vehicle);
  let processedHtml = mustache.render(singleVideoTemplate, video);
  $(`${parentTarget} .singleVideoTemplateTarget`).html(processedHtml).ready(rebindSingleVideo(parentTarget, vehicle, video));
}

function rebindSingleVideo(parentTarget, vehicle, video) {
  return () => {

    $(`${parentTarget} button#play`).click(function() {
      let videoElement = $(`${parentTarget} video`).get(0);
      if (videoElement.paused) {
        videoElement.play();
        vehicle.recentVideos.push(video);
        updateState();
        $(this).find('i.play').removeClass('play').addClass('pause');
      } else {
        videoElement.pause();
        $(this).find('i.pause').removeClass('pause').addClass('play');
      }
    });

    $(`${parentTarget} button#favorite`).click(() => {
      video.favorite = true;
      updateState();
      console.log('video is a favorite');
    });
  }
}

var updateState = function() {
  if (window.webkit && window.webkit.messageHandlers) {
    window.webkit.messageHandlers.notification.postMessage(JSON.stringify(currentVehicle));
    console.log('state updated');
  } else {
    console.log('state NOT updated', currentVehicle);
  }
}

function redHeader() {
  $('h3').style.color = 'red';
}

module.exports = {
  load: load
};
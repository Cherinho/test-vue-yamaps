<template>
  <yandex-map
    :settings="settings"
    :coords="coords"
    :zoom="zoom"
    class="map"
    @map-was-initialized="mapInitialized"
    @click="onClick"
  >
    <ymap-marker :coords="markerCoords" marker-id="1"></ymap-marker>
  </yandex-map>
</template>

<script>
import { yandexMap, loadYmap, ymapMarker } from 'vue-yandex-maps';
import { mapMutations } from 'vuex';

const config = require('../config.json');

export default {
  name: 'Map',
  components: {
    yandexMap,
    ymapMarker,
  },
  async mounted() {
    await loadYmap(config.yamaps);
  },
  data: () => ({
    settings: config.yamaps,
    coords: [55.73, 37.75],
    markerCoords: [],
    zoom: 9,
    map: null,
    airDistance: null,
    groundDistance: null,
  }),
  methods: {
    ...mapMutations(['addBaloon']),
    mapInitialized(instance) {
      this.map = instance;
      // eslint-disable-next-line no-undef
      const polygon = new ymaps.Polygon(config.coordinates);
      polygon.options.set('visible', true);
      this.map.geoObjects.add(polygon);
    },
    onClick(e) {
      this.markerCoords = e.get('coords');
    },
  },
  watch: {
    markerCoords(newVal) {
      const closestPoint = this.map.geoObjects
        .get(0)
        .geometry
        .getClosest(newVal).position;

      this.addBaloon(newVal);

      this.map.geoObjects.splice(1, this.map.geoObjects.getLength());
      // eslint-disable-next-line no-undef
      ymaps.route([newVal, closestPoint], { reverseGeocoding: true }).then((res) => {
        this.groundDistance = Math.ceil(res.getLength() / 1000);
        console.log(`Ground distance to MKAD - ${this.groundDistance} km`);
      });
      // eslint-disable-next-line no-undef
      ymaps.geocode(newVal, { json: true, results: 1 }).then((res) => {
        // eslint-disable-next-line max-len
        console.log(`Address:${res.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.text}`);
      });
      // eslint-disable-next-line no-undef
      ymaps.route([newVal, this.coords]).then((res) => {
        // eslint-disable-next-line no-undef
        const pathsObjects = ymaps.geoQuery(res.getPaths());
        const edges = [];
        const moscowPolygon = this.map.geoObjects.get(0);

        pathsObjects.each((path) => {
          const coordinates = path.geometry.getCoordinates();
          // eslint-disable-next-line no-plusplus
          for (let i = 1, l = coordinates.length; i < l; i++) {
            const point = [coordinates[i], coordinates[i - 1]];
            if (!moscowPolygon.geometry.contains(point[0])) {
              edges.push({
                type: 'LineString',
                coordinates: point,
              });
            }
          }
        });

        // eslint-disable-next-line no-undef
        const routeObjects = ymaps.geoQuery(edges)
          .add(res.getViaPoints())
          .addToMap(this.map);

        routeObjects.setOptions({
          strokeColor: '#0010ff',
          preset: 'islands#blueIcon',
        });
      });
      // eslint-disable-next-line no-undef
      const line = new ymaps.geometry.LineString([newVal, closestPoint]);
      // eslint-disable-next-line no-undef
      const geoObject = new ymaps.GeoObject({ geometry: line }, { strokeColor: '000000', strokeStyle: 'dash' });
      this.map.geoObjects.add(geoObject);
      this.airDistance = Math.ceil(geoObject.geometry.getDistance() / 1000);
      console.log(`Air distance to MKAD - ${this.airDistance} km`);
    },
  },
};
</script>

<style>
.map {
  height: 100vh;
}
</style>

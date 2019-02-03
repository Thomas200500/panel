import Vue from 'vue';

export default Vue.component('message-box', {
    props: {
        title: {type: String, required: false},
        message: {type: String, required: true}
    },
    template: `
        <div class="lg:inline-flex" role="alert">
            <span class="title" v-html="title" v-if="title && title.length > 0"></span>
            <span class="message" v-html="message"></span>
        </div>
    `,
})
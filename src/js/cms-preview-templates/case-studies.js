import React from 'react';

export default class CaseStudyPreview extends React.Component {
  render() {
    const { entry, widgetFor, getAsset } = this.props;

    return (
      <body>
        <section>
          <div class="main-case-study">
            <h1 class="title" style={{ textAlign: 'center' }}>
              {entry.getIn(['data', 'title'])}
            </h1>
            <h2 class="subtitle" style={{ textAlign: 'center' }}>
              {entry.getIn(['data', 'case_subtitle'])}
            </h2>
            <img src={getAsset(entry.getIn(['data', 'case_feature_img']))} />
            <p class="summary">{entry.getIn(['data', 'case_summary'])}</p>
            <div class="case-details" />
            <div class="case-links" />
          </div>
        </section>
        <section>
          <div class="content-case-study">{widgetFor('body')}</div>
        </section>
      </body>
    );
  }
}

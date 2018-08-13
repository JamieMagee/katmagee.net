import CMS from 'netlify-cms';
import React from 'react';

import CaseStudyPreview from './cms-preview-templates/case-studies';

class ColorControl extends React.Component {
  render() {
    return (
      <input
        style={{ height: '80px' }}
        type="color"
        value={this.props.value}
        onInput={e => this.props.onChange(e.target.value)}
      />
    );
  }
}

CMS.registerPreviewStyle('/css/final.css');
CMS.registerPreviewStyle(
  'https://fonts.googleapis.com/css?family=Roboto:300,400,700'
);
CMS.registerWidget('color', ColorControl);
CMS.registerPreviewTemplate('casestudies', CaseStudyPreview);

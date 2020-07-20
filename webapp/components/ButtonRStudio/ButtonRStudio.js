import './ButtonRStudio.scss'
import React from 'react'
import PropTypes from 'prop-types'

const ButtonRStudio = (props) => {
  const { disabled, onClick } = props

  return (
    <button type="button" className="btn btn-s btn-rstudio" onClick={onClick} aria-disabled={disabled}>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1784.1 625.9">
        <g id="Gray_Logo" />
        <g id="Black_Letters" />
        <g id="Blue_Gradient_Letters">
          <g>
            <ellipse
              transform="matrix(0.7071 -0.7071 0.7071 0.7071 -127.9265 317.0317)"
              className="st0"
              cx="318.7"
              cy="312.9"
              rx="309.8"
              ry="309.8"
            />
            <g>
              <path
                className="st1"
                d="M694.4,404.8c16.1,10.3,39.1,18.1,63.9,18.1c36.7,0,58.1-19.4,58.1-47.4c0-25.5-14.8-40.8-52.3-54.8
				c-45.3-16.5-73.3-40.4-73.3-79.1c0-43.3,35.8-75.4,89.8-75.4c28,0,49,6.6,61,13.6l-9.9,29.3c-8.7-5.4-27.2-13.2-52.3-13.2
				c-37.9,0-52.3,22.7-52.3,41.6c0,26,16.9,38.7,55.2,53.6c47,18.1,70.5,40.8,70.5,81.6c0,42.8-31.3,80.3-96.8,80.3
				c-26.8,0-56-8.2-70.9-18.1L694.4,404.8z"
              />
              <path
                className="st1"
                d="M943.3,201.3v47.8h51.9v27.6h-51.9v107.5c0,24.7,7,38.7,27.2,38.7c9.9,0,15.7-0.8,21-2.5l1.6,27.6
				c-7,2.5-18.1,4.9-32.1,4.9c-16.9,0-30.5-5.8-39.1-15.2c-9.9-11.1-14-28.8-14-52.3V276.7h-30.9v-27.6h30.9V212L943.3,201.3z"
              />
              <path
                className="st1"
                d="M1202.8,393.7c0,21,0.4,39.1,1.6,54.8h-32.1l-2.1-32.5h-0.8c-9.1,16.1-30.5,37.1-65.9,37.1
				c-31.3,0-68.8-17.7-68.8-87.3V249.1h36.3v110c0,37.9,11.9,63.9,44.5,63.9c24.3,0,41.2-16.9,47.8-33.4c2.1-4.9,3.3-11.5,3.3-18.5
				v-122h36.3V393.7z"
              />
              <path
                className="st1"
                d="M1434.8,156v241c0,17.7,0.8,37.9,1.6,51.5h-32.1l-1.6-34.6h-1.2c-10.7,22.2-34.6,39.1-67.2,39.1
				c-48.2,0-85.7-40.8-85.7-101.4c-0.4-66.3,41.2-106.7,89.4-106.7c30.9,0,51.1,14.4,60.2,30.1h0.8V156H1434.8z M1398.9,330.2
				c0-4.5-0.4-10.7-1.6-15.2c-5.4-22.7-25.1-41.6-52.3-41.6c-37.5,0-59.7,33-59.7,76.6c0,40.4,20.2,73.8,58.9,73.8
				c24.3,0,46.6-16.5,53.1-43.3c1.2-4.9,1.6-9.9,1.6-15.7V330.2z"
              />
              <path
                className="st1"
                d="M1535.7,193c0,12.4-8.7,22.2-23.1,22.2c-13.2,0-21.8-9.9-21.8-22.2c0-12.4,9.1-22.7,22.7-22.7
				C1526.6,170.4,1535.7,180.3,1535.7,193z M1495.3,448.5V249.1h36.3v199.4H1495.3z"
              />
              <path
                className="st1"
                d="M1772.2,347.1c0,73.7-51.5,105.9-99.3,105.9c-53.6,0-95.6-39.6-95.6-102.6c0-66.3,44.1-105.5,98.9-105.5
				C1733.5,245,1772.2,286.6,1772.2,347.1z M1614.4,349.2c0,43.7,24.7,76.6,60.2,76.6c34.6,0,60.6-32.5,60.6-77.5
				c0-33.8-16.9-76.2-59.7-76.2C1632.9,272.1,1614.4,311.7,1614.4,349.2z"
              />
            </g>
            <g>
              <path
                className="st2"
                d="M424.7,411.8h33.6v26.1h-51.3L322,310.5h-45.3v101.3h44.3v26.1H209.5v-26.1h38.3V187.3l-38.3-4.7v-24.7
				c14.5,3.3,27.1,5.6,42.9,5.6c23.8,0,48.1-5.6,71.9-5.6c46.2,0,89.1,21,89.1,72.3c0,39.7-23.8,64.9-60.7,75.6L424.7,411.8z
				 M276.7,285.3l24.3,0.5c59.3,0.9,82.1-21.9,82.1-52.3c0-35.5-25.7-49.5-58.3-49.5c-15.4,0-31.3,1.4-48.1,3.3V285.3z"
              />
            </g>
            <g>
              <path
                className="st1"
                d="M1751.8,170.4c-12.9,0-23.4,10.5-23.4,23.4c0,12.9,10.5,23.4,23.4,23.4c12.9,0,23.4-10.5,23.4-23.4
				C1775.2,180.9,1764.7,170.4,1751.8,170.4z M1771.4,193.8c0,10.8-8.8,19.5-19.5,19.5c-10.8,0-19.5-8.8-19.5-19.5
				c0-10.8,8.8-19.5,19.5-19.5C1762.6,174.2,1771.4,183,1771.4,193.8z"
              />
              <path
                className="st1"
                d="M1760.1,203.3l-5.8-8.5c3.3-1.2,5-3.6,5-7c0-5.1-4.3-6.9-8.4-6.9c-1.1,0-2.2,0.1-3.2,0.3
				c-1,0.1-2.1,0.2-3.1,0.2c-1.4,0-2.5-0.2-3.7-0.5l-0.6-0.1v3.3l3.4,0.4v18.8h-3.4v3.4h10.9v-3.4h-3.9v-7.9h3.2l7.3,11l0.2,0.2h5.3
				v-3.4H1760.1z M1755.6,188.1c0,1.2-0.5,2.2-1.4,2.9c-1.1,0.8-2.8,1.2-5,1.2l-1.9,0v-7.7c1.4-0.1,2.6-0.2,3.7-0.2
				C1753.1,184.3,1755.6,185,1755.6,188.1z"
              />
            </g>
          </g>
        </g>
        <g id="White_Letters" />
        <g id="R_Ball" />
      </svg>
    </button>
  )
}

ButtonRStudio.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}

ButtonRStudio.defaultProps = {
  disabled: false,
}

export default ButtonRStudio
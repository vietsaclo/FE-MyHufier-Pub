import { Button, Checkbox } from 'antd';
import React, { Component } from 'react';
import FACTORY from '../../../common/FACTORY';
import ButtonExamComponent from '../../default/components/posts/components/components/ButtonExamComponent';
import ButtonAddQA from '../ButtonAddQA';
import ButtonListEditQA from '../ButtonListEditQA';
import MyImageView from '../MyImageView';

class CardExamTest extends Component {
  cbSetRealTestChange(postId, checked) {
    if (checked)
      this.props.showModalRealTestConf(postId);
  }

  getCardHeader(postId, isRealTest) {
    if (!isRealTest)
      return (
        <div className='card-header'>
          <Checkbox
            onChange={(e) => this.cbSetRealTestChange(postId, e.target.checked)}
          >Đặt làm bài kiểm tra</Checkbox>
        </div>
      );
    return (
      <Button type='dashed' block danger>+ Người làm bài</Button>
    )
  }

  getButtonExam(v) {
    if (v.isRealTest)
      return (
        <button
          className='btn-ds outline-pr block'
          onClick={() => false}
        >
          <i className="fas fa-tasks">&nbsp;</i>
          Làm kiểm tra
        </button>
      );
    return (
      <ButtonExamComponent
        post={{
          countQuestion: 100,
          id: v.id,
          title: v.title,
        }}
      />
    );
  }

  render() {
    const { v, updateAt, onAdded, userLoged } = this.props;
    const isAdmin = userLoged && userLoged.role === 'ADMIN';
    return (
      <div className='col'>
        <div className="card border">
          {isAdmin ?
            this.getCardHeader(v.id, v.isRealTest) : ''}
          <div className='card-img-top-exam'>
            <MyImageView
              className="card-img-top w-100" alt="banner-exam"
              src={FACTORY.fun_getImageViewFromServer(v.imageBanner, v.imageUploadType)}
            />
          </div>

          <div className="card-body examtest-body">
            <h5 className="card-title">{v.title}</h5>
            <p className="card-text">{v.description}</p>
            {this.getButtonExam(v)}
          </div>
          <div className='card-footer'>
            <span className='fw-bold m-0 p-0'>Updated:</span> {updateAt}.
              <br />
            <span className='fw-bold m-0 p-0'>Ngân hàng:</span> <span className='_text-sec fw-bold'>{v.numQ}</span> Câu hỏi.
            </div>
          <div className='card-footer'>
            <div className='row'>
              <div className='col-6'>
                <ButtonAddQA postId={v.id} countQa={v.numQ}
                  onAdded={(num, postId) => onAdded(num, postId)}
                />
              </div>
              <div className='col-6'>
                <ButtonListEditQA postId={v.id}
                  onAdded={(num, postId) => onAdded(num, postId)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CardExamTest;
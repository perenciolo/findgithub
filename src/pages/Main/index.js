import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ActivityIndicator, Keyboard } from 'react-native';

import {
  Avatar,
  Bio,
  Container,
  Form,
  Input,
  List,
  Name,
  ProfileButton,
  ProfileButtonText,
  SubmitButton,
  User,
} from './styles';

import api from '../../services/api';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    loading: false,
    newUser: '',
    users: [],
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) this.setState({ users: JSON.parse(users) });
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;
    if (prevState.users !== users)
      AsyncStorage.setItem('users', JSON.stringify(users));
  }

  handleAddUser = async () => {
    const { newUser, users } = this.state;

    this.setState({ loading: true });

    const response = await api.get(`/users/${newUser}`);
    const { name, login, bio, avatar_url: avatar } = response.data;
    const data = {
      name,
      login,
      bio,
      avatar,
    };

    this.setState({
      users: [...users, data],
      newUser: '',
    });

    Keyboard.dismiss();
    this.setState({ loading: false });
  };

  handleNavigation = async user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  render() {
    const { users, newUser, loading } = this.state;

    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={text => this.setState({ newUser: text })}
            value={newUser}
            placeholder="Adicionar Usuário"
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>
        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>
              <ProfileButton onPress={() => this.handleNavigation(item)}>
                <ProfileButtonText>Ver Perfil</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}

import TestFilters from '../support/filterTests.js'

TestFilters([], () => {
    describe('MonacaMapApp', function () {
        var lat = 10.7723266
        var lng = 106.62461289999999
        beforeEach(() => {
            cy.viewport('iphone-x')
            cy.visit('http://localhost:8080', fakeLocation(lat, lng))

            cy.wait(2000)
            // Close warning message "This page can't load Google Maps correctly."
            cy.get('div', {timeout: 5000}).then($div => {
                if ($div.find('button[class="dismissButton"]').length > 0) {   
                  cy.get('button[class="dismissButton"]').contains('OK').should('be.visible')
                  cy.get('button[class="dismissButton"]').contains('OK').click()
                }
            });
        })
    
        it('Handling UI home screen', function () {
            cy.get('h1').contains('MonacaMapApp').should('be.visible')
            cy.contains('画面クリア').should('be.visible')
            cy.contains('Shop').should('be.visible')
            cy.get('input[name="lat"]').should('have.value', lat)
            cy.get('input[name="lng"]').should('have.value', lng)
            cy.get('#save').find('small').should('have.text', '保存')
            cy.get('#all').find('small').should('have.text', '全件')
            cy.get('#circle').find('small').should('have.text', '円形')
            cy.get('#square').find('small').should('have.text', '矩形')
        })
    
        it('Handling event map - Click move map', function () {
            cy.get('#map_canvas').trigger('mousedown')
            cy.wait(3000)
            cy.get('#map_canvas').trigger('mouseup')
        })
    
        it('Handling save location (保存) - Input Text in prompt, Click OK and Validate Input Text', () => {
            cy.window().then((win) => {
                cy.stub(win, 'prompt').returns('my location')
                cy.get('#save').click()
            })
            cy.on('window:alert', (str) => {
                expect(str).to.equal('保存に成功しました')
            })
        })
    
        it('Handling show all location (全件) - Validate Alert Text and Click OK', () => {
            let count = 0
            cy.on('window:alert', (str) => {
                count += 1
                switch (count) {
                case 1:
                    expect(str).to.equal('全件検索')
                    return true
                case 2:
                    expect(str).to.equal('全件検索に成功しました')
                    return true
                }
            })
            cy.on('window:confirm', () => true)
            cy.get('#all').click()
        })
    
        it('Handling show circle location (円形) - Validate Alert Text and Click OK', () => {
            let count = 0
            cy.on('window:alert', (str) => {
                count += 1
                switch (count) {
                case 1:
                    expect(str).to.equal('円形検索(現在地から半径3km)')
                    return true
                case 2:
                    expect(str).to.equal('円形検索に成功しました')
                    return true
                }
            })
            cy.on('window:confirm', () => true)
            cy.get('#circle').click()
        })
    
        it('Handling show square location (矩形) - Validate Alert Text and Click OK', () => {
            let count = 0
            cy.on('window:alert', (str) => {
                count += 1
                switch (count) {
                case 1:
                    expect(str).to.equal('矩形検索(新宿駅と西新宿駅の間)')
                    return true
                case 2:
                    expect(str).to.equal('矩形検索に成功しました')
                    return true
                }
            })
            cy.on('window:confirm', () => true)
            cy.get('#square').click()
        })
    
        it('Handling clear marker', () => {
            cy.contains('画面クリア').click()
            expect(true).to.be.true
        })
    
        it('Handling show shop - Validate have ShopA', () => {
            cy.contains('Shop').click()
            cy.get('div[title="<h2>ShopA</h2><p>カレー</p>"]').should('be.visible')
        })

        // Fake location user
        function fakeLocation(latitude, longitude) {
            return {
                onBeforeLoad(win) {
                    cy.stub(win.navigator.geolocation, "getCurrentPosition", (cb, err) => {
                    if (latitude && longitude) {
                        return cb({ coords: { latitude, longitude } });
                    }
                    throw err({ code: 1 }); // 1: rejected, 2: unable, 3: timeout
                    });
                }
            };
        }
    })
})